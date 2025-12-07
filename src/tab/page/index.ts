/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="es2022" />
/// <reference types="wicg-file-system-access" />

import { getOriginPrivateDirectory } from '../../../vendor/file-system-access/getOriginPrivateDirectory';
import memoryAdapter, { FileSystemAccessEvents, FolderHandle, MemoryAdapterOptions } from '../../../vendor/file-system-access/adapters/memory';
import { sleep } from '../../shared/utils';
import FileSystemDirectoryHandle from '../../../vendor/file-system-access/FileSystemDirectoryHandle';
import FileSystemFileHandle from '../../../vendor/file-system-access/FileSystemFileHandle';
import { $ } from './query_helper';
import { createBridge } from '../bridge/event_bridge';
import { COMM_ID, IS_FIREFOX } from '../../env';
import EventEmitter from '../../shared/event_emitter';
import { getEntryContent, getScriptList, setEntryContent } from './messaging';
import { makeDirHandleFromList } from './userscripts';
import { lock } from '../../shared/lock';
import { cloneInto, exportFunction } from '../shared/sandbox';
import { PageContentBridge } from '../../types/communication';

(async (global: Window & typeof globalThis) => {
    const V = false;
    const D = true;
    const w = global as any;
    const Worker = global.Worker;

    let dirHandle: globalThis.FileSystemDirectoryHandle | undefined; // eslint-disable-line prefer-const

    const bridge = createBridge({ sendPrefix: '2C', listenPrefix: '2P'}) as PageContentBridge;
    bridge.init(COMM_ID);

    global.showOpenFilePicker = exportFunction(async (pickerOpts) => {
        if (V) console.debug('showOpenFilePicker', pickerOpts);
        return [] as any;
    }, w);
    global.showDirectoryPicker = exportFunction(async (pickerOpts) => {
        if (V) console.debug('showDirectoryPicker', pickerOpts);
        let w = 0;
        while (w++ < 10 * 5 && !dirHandle) {
            await sleep(100);
        }
        if (!dirHandle) {
            alert('No extension is there to communicate.');
            throw new DOMException('No extension is there to communicate.');
        }
        return dirHandle;
    }, w);

    const list = await getScriptList(bridge);
    const root = new FolderHandle('unused', false);

    makeDirHandleFromList(root, list, {
        get: async (name: string, path: string, ifModifiedSince?: number) => {
            return await lock(async () => {
                const { value, lastModified } = await getEntryContent(bridge, path, ifModifiedSince);
                return new File([ value || '' ], name, { lastModified });
            });
        },
        set: async (_name: string, path: string, file: File) => {
            return await lock(async () => {
                await setEntryContent(bridge, path, await file.text(), file.lastModified);
            });
        }
    });

    const eventEmitter = new EventEmitter<FileSystemAccessEvents>();
    dirHandle = await getOriginPrivateDirectory<MemoryAdapterOptions>(memoryAdapter, { name: 'Tampermonkey', eventEmitter, entries: root._entries });

    w.FileSystemDirectoryHandle = exportFunction(FileSystemDirectoryHandle, w);
    w.FileSystemFileHandle = exportFunction(FileSystemFileHandle, w);

    if (!IS_FIREFOX) {
        const R = w.Reflect as typeof Reflect;
        const P = w.Proxy as typeof Proxy;
        w.Worker = new P(Worker, cloneInto({
            construct: (_: any, [ scriptUrl, options ]: [ scriptURL: string | URL, options?: WorkerOptions ]) => {
                const w = new Worker(scriptUrl, options);
                let onmessage: ((message: any) => void) | undefined;

                return new P(w, {
                    get: <T>(_: any, name: string | symbol): T | undefined => {
                        if (name === 'postMessage') {
                            return ((message: any) => {
                                const { method } = message;
                                if (method === 'listDirectory' || method === 'searchDirectory') {
                                    // { vsWorker: 1, req: '2', method: 'listDirectory', args: Array(5), type: 0 }
                                    const { vsWorker, req, method } = message;

                                    setTimeout(() => {
                                        if (onmessage) onmessage({
                                            data: {
                                                vsWorker,
                                                seq: req,
                                                method,
                                                type: 1 /* Reply */,
                                                res: {
                                                    results: [],
                                                    limitHit: 0
                                                }
                                            }
                                        });
                                    }, 100);
                                    return;
                                }
                                if (V) console.debug('postMessage', message);
                                w.postMessage(message);
                            }) as any;
                        } else if ([
                            'addEventListener',
                            'removeEventListener',
                            'terminate'
                        ].includes(name as string)) {
                            if (name === 'addEventListener') {
                                return ((event: string, cb: any) => {
                                    if (event === 'message') {
                                        onmessage = cb;
                                        return w.addEventListener(event, (message: any) => {
                                            if (V) console.debug('onmessage', message);
                                            if (onmessage) onmessage(message);
                                        });
                                    } else {
                                        return w.addEventListener(event, cb);
                                    }
                                }) as any;
                            }
                            return (w as any)[name].bind(w) as any;
                        } else {
                            return R.get(_, name);
                        }
                    },
                    set: (_: any, name: string, value: any) => {
                        if (name === 'onmessage' && typeof value === 'function') {
                            onmessage = value;
                            return (w.onmessage = (message: any) => {
                                if (V) console.debug('onmessage', message);
                                return onmessage && onmessage(message) as any;
                            }) as any;
                        } else {
                            return R.set(_, name, value);
                        }
                    }
                });
            }
        }, w, { cloneFunctions: true }));
    }

    $(() => {
        const i = setInterval(() => {
            let e = $('.codicon-folder-opened').parent<HTMLElement>()[0];
            if (!e) {
                const b = $<HTMLButtonElement>('.monaco-text-button');
                const t = b.text();
                if (typeof t == 'string' && t.indexOf('Open Folder') != -1) e = b[0];
            }
            if (e) {
                e.click();
                if (D) console.log('Tampermonkey FileSystem automatically opened');
                clearInterval(i);
            }
        }, 500);
    });


    if (D) console.log('Tampermonkey FileSystem registration finished');
})(IS_FIREFOX ? ((window as any).wrappedJSObject || window) : window);