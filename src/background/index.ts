/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="webworker" />
/// <reference types="chrome" />
/// <reference types="firefox-webext-browser" />
/// <reference lib="es2017" />

import '../../src/polyfills';
import { logger as console } from '../shared/logger';
import { IS_EVENTPAGE, IS_FIREFOX, IS_MV3 } from '../env';
import Config from './config';
import { findTm } from './find_tm';
import Storage from './storage';
import { hasHostPermission, requestHostPermission } from './host_permission';
import { BackgroundToContent, ContentToBackground } from '../types/communication';
import { ExternalRequest } from '../types/external';

const MAIN_URL = 'https://vscode.dev/?connectTo=tampermonkey';
const { runtime, action, tabs, webNavigation, scripting } = chrome;

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
                ...{ injectImmediately: true } as any,
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
                ...{ injectImmediately: true } as any,
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

    const handleMessage = async (request: ContentToBackground, sendResponse: (response?: BackgroundToContent) => void): Promise<void> => {
        if (lock) {
            await lock;
            return handleMessage(request, sendResponse);
        } else {
            let resolve: () => void = () => null;

            lock = new Promise<void>(r => resolve = r);
            lock.then(() => lock = undefined);

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

    runtime.onMessage.addListener((request, _sender, sendResponse) => {
        handleMessage(request, sendResponse);
        return true;
    });

    let hhp: boolean | undefined;
    action.onClicked.addListener(async (_details) => {
        void(runtime.lastError);
        if (!hhp) {
            const granted = await requestHostPermission();
            if (granted) {
                hhp = granted;
                setForbidden(!hhp);
            } else {
                return;
            }
        }

        tabs.query({ url: MAIN_URL + '*' }, info => {
            if (info && info.length && info[0].id) {
                tabs.update(info[0].id, { active: true }, () => runtime.lastError);
            } else {
                tabs.create({ url: MAIN_URL, active: true }, () => runtime.lastError);
            }
        });

    });

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


