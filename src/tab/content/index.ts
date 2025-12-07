/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="es2022" />
/// <reference types="chrome" />

import { COMM_ID, IS_FIREFOX } from '../../env';
import { ContentToBackground, ContentPageBridge, BackgroundToContent } from '../../types/communication';
import { createBridge } from '../bridge/event_bridge';
import { cloneInto } from '../shared/sandbox';
export type PageJs = () => void;

const { runtime } = chrome;

(async (_global, globalThis) => {
    const V = false;
    // const D = false;

    const bridge = createBridge({ sendPrefix: '2P', listenPrefix: '2C', cloneInto }) as ContentPageBridge;
    bridge.init(COMM_ID);

    bridge.setMessageListener((request, sendResponse) => {
        if (V) console.log('content: forwarding request', request);

        runtime.sendMessage(<ContentToBackground>request, (response: BackgroundToContent) => {
            if (V) console.log('content: forwarding response', response);
            sendResponse(response);
        });
    });

    if (IS_FIREFOX) {
        const pjs = await new Promise<PageJs | undefined>(resolve => {
            if (globalThis.pagejs) {
                resolve(globalThis.pagejs);
                return;
            } else {
                const set: ((value?: PageJs) => void) | undefined = (value?: PageJs): void => {
                    delete globalThis.pagejs;
                    resolve(value);
                };

                Object.defineProperty(globalThis, 'pagejs', {
                    set,
                    configurable: true
                });
            }
        });
        const script = document.createElement('script');
        script.textContent = `(${pjs})();`;
        document.documentElement.appendChild(script);
        script.remove();
    }
})(window, typeof globalThis === 'undefined' ? window : globalThis as any);