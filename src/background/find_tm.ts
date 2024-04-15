
import { IS_FIREFOX } from '../env';
import { short_id } from './browser';
import { logger as console } from '../shared/logger';
import { getRandomString } from '../shared/utils';
import { OptionsExternalRequest, OptionsExternalResponse } from '../tab/page/types';
import Config from './config';

export const ExtensionIdsToTry = IS_FIREFOX
    ? [
        'firefox@tampermonkey.net',
        'firefoxbeta@tampermonkey.net'
    ] as const
    : [
        'dhdgffkkebhmkfjojejmpbldmpobfkfo',
        'gcalenpjmijncebpfijmoaglllgpjagf',
        'iikmkjmpaadaobahmlepeloendndfphd',
        'fcmfnpggmnlmfebfghbfnillijihnkoh',
        'heiflgcdlcilkmbminjohdnmejohiblb'
    ] as const;

export type ExtensionIdToTry = typeof ExtensionIdsToTry[number];

const OFFICIAL_EXTENSION_SHORT_IDS: string[] = [
    'lieo'
];

const { runtime } = chrome;
const active_connections: Partial<Record<ExtensionIdToTry, false | chrome.runtime.Port>> = {};

export const findTm = async (activeUrls: string[]): Promise<{ id: string, port: chrome.runtime.Port }[]> => {
    const to_try = !OFFICIAL_EXTENSION_SHORT_IDS.length || OFFICIAL_EXTENSION_SHORT_IDS.includes(short_id) ? ExtensionIdsToTry : Config.values.externalExtensionIds;

    await Promise.all(to_try.map(id => {
        if (active_connections[id] !== undefined) return;
        active_connections[id] = false;

        return new Promise<void>(resolve => {
            try {
                const port = runtime.connect(id);
                const messageId = getRandomString();
                port.postMessage(<OptionsExternalRequest>{ method: 'userscripts', action: 'options', messageId, activeUrls });

                port.onMessage.addListener((m: OptionsExternalResponse | undefined) => {
                    void(runtime.lastError);
                    if (!m) {
                        delete active_connections[id];
                        port.disconnect();
                    }
                    if (m && m.messageId === messageId && m.allow && m.allow.includes('list')) {
                        active_connections[id] = port;
                    }
                    resolve();
                });
                port.onDisconnect.addListener(_p => {
                    void(runtime.lastError);
                    delete active_connections[id];
                    resolve();
                });
            } catch (e) {
                console.debug(`unable to talk to ${id}`, e);
                resolve();
            }
        });
    }));

    return (Object.keys(active_connections) as ExtensionIdToTry[]).filter(k => active_connections[k] !== false).map(id => ({ id, port: active_connections[id] as chrome.runtime.Port }));
};
