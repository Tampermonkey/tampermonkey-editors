/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="webworker" />
/// <reference types="chrome" />
/// <reference types="firefox-webext-browser" />
/// <reference lib="es2017" />

import '../../src/polyfills';
import { logger as console } from '../shared/logger';
import { IS_EVENTPAGE, IS_FIREFOX, IS_MV3 } from '../env';
import { ExtensionRequestMessage, ExtensionResponseMessage } from '../types/extension';
import { WebSocketIncomingMessage } from '../types/websocket';
import Config from './config';
import { findTm } from './find_tm';
import Storage from './storage';
import { BackgroundToContent, ContentToBackground } from '../types/communication';
import { ExternalRequest } from '../types/external';
import { hasHostPermission } from './host_permission';
import { LocalWebSocketClient } from './websocket';

const MAIN_URL = 'https://vscode.dev/?connectTo=tampermonkey';
const { runtime, action, tabs, webNavigation, scripting } = chrome;
const D = true;

const setForbidden = async (forbidden: boolean) => {
    /* eslint-disable @typescript-eslint/naming-convention */
    if (forbidden) {
        action.setIcon({
            path: {
                16: 'images/icon_forbidden.png',
                24: 'images/icon24_forbidden.png',
                32: 'images/icon32_forbidden.png',
                48: 'images/icon48_forbidden.png',
                128: 'images/icon128_forbidden.png',
            },
        });
        action.setTitle({ title: 'Tampermonkey Editors - has no access to vscode.dev' });
    } else {
        action.setIcon({
            path: {
                16: 'images/icon.png',
                24: 'images/icon24.png',
                32: 'images/icon32.png',
                48: 'images/icon48.png',
                128: 'images/icon128.png',
            },
        });
        action.setTitle({ title: 'Tampermonkey Editors' });
    }
    /* eslint-enable @typescript-eslint/naming-convention */
};

const initWebNavigation = () => {
    webNavigation.onCommitted.addListener(async details => {
        const { url, tabId } = details;
        if (url.startsWith(MAIN_URL)) {
            scripting.executeScript({
                files: [
                    'content.js'
                ],
                target: {
                    tabId,
                    frameIds: [ 0 ]
                },
                ...{ injectImmediately: true },
                world: 'ISOLATED'
            });
            scripting.executeScript({
                files: [
                    'page.js'
                ],
                target: {
                    tabId,
                    frameIds: [ 0 ]
                },
                ...{ injectImmediately: true },
                world: IS_FIREFOX ? 'ISOLATED' : 'MAIN'
            });
        }
    });
};

const initRegisteredContentScripts = async () => {
    const scripts = [
        {
            id: 'content',
            matches: [ MAIN_URL + '*' ],
            js: [ 'content.js' ],
            runAt: 'document_start' as const,
        },
        {
            id: 'js',
            matches: [ MAIN_URL + '*' ],
            js: [ 'page.js' ],
            runAt: 'document_start' as const,
        }
    ];
    const reg = await browser.scripting.getRegisteredContentScripts();
    if (reg.length) {
        await browser.scripting.unregisterContentScripts({
            ids: reg.map(s => s.id)
        });
    }
    await browser.scripting.registerContentScripts(scripts);
};

const init = async () => {
    if (IS_FIREFOX) {
        initRegisteredContentScripts();
    } else if (IS_MV3) {
        initWebNavigation();
    }

    const handleMessage = async (request: ContentToBackground, sendResponse: (response: BackgroundToContent) => void): Promise<void> => {
        if (lock) {
            await lock;
            return handleMessage(request, sendResponse);
        } else {
            let resolve: () => void = () => null;

            lock = new Promise<void>(r => resolve = r);
            lock.finally(() => lock = undefined);

            const r = await findTm([ MAIN_URL ]);

            if (!r.length) {
                sendResponse({ error: 'no extension to talk to' });
                resolve();
                return;
            }

            const [ { id, port } ] = r;
            console.log(`Found extension ${id}`);

            const h = (response: BackgroundToContent) => {
                sendResponse(response);
                port.onMessage.removeListener(h);
                resolve();
            };

            port.onMessage.addListener(h);
            port.postMessage(<ExternalRequest>{ method: request.method, ...request.args });
            await lock;
            lock = undefined;
        }
    };

    const setupWebSocketRelay = (wsClient: LocalWebSocketClient) => {
        const allowedActions = ['list', 'get', 'set', 'patch'];

        wsClient.listen(async (msg: WebSocketIncomingMessage) => {
            if (D) console.debug('WebSocket message received:', msg);

            if (!('action' in msg) || !allowedActions.includes(msg.action)) {
                console.warn('Invalid action received from WebSocket client', msg);
                return;
            }

            const m: ContentToBackground = { method: 'userscripts', args: {...msg } };

            await handleMessage(m, (response?: ExtensionResponseMessage) => {
                try {
                    wsClient.send({ id: msg.messageId, response });
                } catch (e) {
                    console.error('Response send error:', e);
                }
            });
        });
    };

    runtime.onMessage.addListener((request: ExtensionRequestMessage, sender, sendResponse: (r: ExtensionResponseMessage) => void): true | undefined => {
        if (D) console.log(request.method, request);
        switch (request.method){
            case 'connectWebSocket': {
                if (sender.id !== runtime.id) {
                    sendResponse({ ok: false, error: `Invalid sender id ${sender.id}` });
                    return;
                }

                if (D) console.log('Connecting WebSocket client with request:', request);
                const { authorization, port } = request.args || {};
                if (!authorization || !port) {
                    sendResponse({ ok: false, error: 'Missing authorization or port' });
                    return;
                }
                const socket = new LocalWebSocketClient(authorization, port);
                setupWebSocketRelay(socket);
                (async () => {
                    try {
                        await socket.connected;
                        if (D) console.log(`WebSocket client connected with auth: ${authorization}, port: ${port}`);
                        sendResponse({ ok: true });
                    } catch (e: any) {
                        console.error('WebSocket connection error:', e);
                        sendResponse({ ok: false, error: e?.message || e?.reason || e });
                    }
                })();
                break;
            }
            case 'openOnlineEditor': {
                if (sender.id !== runtime.id) {
                    sendResponse({ ok: false, error: `Invalid sender id ${sender.id}` });
                    return;
                }

                openOnlineEditor();
                break;
            }
            default: {
                handleMessage(request, sendResponse);
            }
        }
        return true;
    });

    let hhp: boolean | undefined;
    const openOnlineEditor = async () => {
        hhp = hhp || await hasHostPermission(MAIN_URL);
        setForbidden(!hhp);
        if (!hhp) {
            throw new Error('Need website permission to find tab with url ' + MAIN_URL);
        }

        tabs.query({ url: MAIN_URL + '*' }, info => {
            if (info && info.length && info[0].id) {
                tabs.update(info[0].id, { active: true }, () => runtime.lastError);
            } else {
                tabs.create({ url: MAIN_URL, active: true }, () => runtime.lastError);
            }
        });
    };

    // eslint-disable-next-line no-async-promise-executor
    let lock: Promise<any> | undefined = (async () => {
        await Storage.init();
        await Config.init();
        console.set(Config.values.logLevel);
    })();

    (async () => {
        hhp = await hasHostPermission(MAIN_URL);
        setForbidden(!hhp);
    })();

    await lock;
    lock = undefined;

    console.log('Tampermonkey Editors initialization done');
};

if (IS_EVENTPAGE) {
    init();
} else if (IS_MV3 ) {
    (async (self: ServiceWorkerGlobalScope) =>{
        self.oninstall = () => self.skipWaiting();
        init();
    })(self as unknown as ServiceWorkerGlobalScope);
} else {
    throw new Error('This should not happen');
}
