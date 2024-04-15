/**
 * @filename storage.ts
 * @author Jan Biniok <jan@biniok.net>
*/

import { logger as console } from '../shared/logger';
import { clearTimeout, setTimeout } from '../shared/environment';
import { LocalStorageObject, LocalStorageValue, Storable } from './types';

interface ExtensionStorage {
    setValue: (uename: string, value: Storable) => Promise<void>,
    setValues: (values: any) => Promise<void>,
    getValue: (uename: string, defaultValue?: Storable) => Storable | undefined,
    deleteAll: () => Promise<void>,
    deleteValue: (uename: string) => Promise<void>,
    listValues: () => string[],
    isWorking?: () => Promise<void>
}
type ExtensionLocalStorageObject = {
    [key: string] : Storable
};

interface StorageImplementation {
    options: { [key: string]: string },
    methods: ExtensionStorage,
    init?: () => Promise<void>,
    clean?: () => Promise<void>
}

type StorageImplementationMethods = 'clean' | 'init';

interface AllStorages extends ExtensionStorage{
    secure: { [key: string]: ExtensionStorage },
    migrate: (from: string, to: string, options?: { [key: string]: string }) => Promise<void>,
    init?: () => Promise<void>,
    factoryReset: () => Promise<void>,
    isWiped: () => Promise<boolean>,
    setVersion: (version: string, schema: string) => Promise<void>,
    getVersion: (dflt: string) => Promise<string>,
    getSchemaVersion: () => string
}

const SV = false;
const STORAGE = 'chromeStorage';
export const KEY_VERSION = 'version';
export const KEY_SCHEMA = 'schema';
export const KEY_CONFIG = 'config';
export const KEY_SESSION = 'session';

const STORAGE_ROUNDTRIP_TIMEOUT = 3 * 60 * 1000;
const PERMANENT_KEYS = (() => {
    /* don't copy  SCHEMA here, cause this is DB dependent! */

    const k = [
        KEY_VERSION
    ];
    const o: ExtensionLocalStorageObject = {};
    k.forEach(e => { o[e] = true });

    return {
        keys: k,
        has: function(k: string) {
            return !!o[k];
        }
    };
})();

const { storage, runtime } = chrome;
const escapeName = (name: string) => name;
const unescapeName = (name: string) => name;

const call = async function(obj: string, method: StorageImplementationMethods): Promise<void> {
    const fn = implementations[obj][method];
    if (fn) {
        await fn();
    }
};

const restoreKeys = async (o: ExtensionStorage, v: ExtensionLocalStorageObject): Promise<void> => {
    await Promise.all(Object.getOwnPropertyNames(v).map(async k => {
        if (v[k] !== undefined) await o.setValue(k, v[k]);
    }));
};

const readKeys = (o: ExtensionStorage, keys: string[]): ExtensionLocalStorageObject => {
    const r: ExtensionLocalStorageObject = {};
    for (const k of keys) {
        const v = o.getValue(k);
        if (v === undefined) continue;
        r[k] = v;
    }

    return r;
};

const chromeStorage: StorageImplementation = (() => {
    const ORIGIN_NORMAL = 'normal';
    let initialized = false;
    let cacheDB: ExtensionLocalStorageObject = {};
    const origin = ORIGIN_NORMAL;

    const me = {
        setValue: async (uename: string, value: Storable) => {
            if (SV) console.debug('chromeStorage: setValue -> ', uename, value);
            const name = escapeName(uename);

            cacheDB[name] = value;
            const s: LocalStorageObject = {};
            // wrap value into a object that also has some origin information
            s[name] = { origin: origin, value: value } ;
            await new Promise<void>(resolve => storage.local.set(s, () => resolve()));
        },
        setValues: async (values: ExtensionLocalStorageObject) => {
            if (SV) console.debug('chromeStorage: setValues -> ', values);

            const s: LocalStorageObject = {};
            Object.keys(values).forEach(uename => {
                const name = escapeName(uename);
                const value = values[uename];

                cacheDB[name] = value;
                s[name] = { origin: origin, value: value } ;
            });

            await new Promise<void>(resolve => storage.local.set(s, () => resolve()));
        },

        getValue: (uename: string, defaultValue?: Storable) => {
            const name = escapeName(uename);
            const v = cacheDB[name] === undefined ? defaultValue : cacheDB[name];
            if (SV) console.debug('chromeStorage: getValue -> ', uename, v);
            return v;
        },
        deleteAll: async () => {
            if (SV) console.debug('chromeStorage: deleteAll()');
            const keys = readKeys(me, PERMANENT_KEYS.keys);

            cacheDB = keys;
            await new Promise<void>(resolve => {
                storage.local.clear(async () => {
                    await restoreKeys(me, keys);
                    resolve();
                });
            });
        },
        deleteValue: async (uename: string) => {
            if (SV) console.debug('chromeStorage: deleteValue -> ' + uename);
            const name = escapeName(uename);

            delete cacheDB[name];
            await new Promise<void>(resolve => storage.local.remove(name, () => resolve()));
        },
        listValues: () => {
            if (SV) console.debug('chromeStorage: listValues');
            const ret: string[] = [];
            Object.getOwnPropertyNames(cacheDB).forEach(i => { ret.push(unescapeName(i)) });
            return ret;
        },
        isWorking: async() => {
            return new Promise<void>((resolve, reject) => {
                let retries = 0;
                const retry_interval = 100;
                const max_retries = 5;

                const b = Date.now();
                const k = 'foo';
                const o: LocalStorageObject = {};
                o[k] = { origin: 'normal', value: b };

                const clear = () => {
                    if (to) clearTimeout(to);
                    to = null;
                };

                const failed = (msg: string | undefined) => {
                    if (++retries <= max_retries) {
                        console.warn('storage:', msg ? msg : 'storage set/get test failed!');
                        setTimeout(test, retries * retries * retry_interval);
                    } else {
                        console.warn('storage: storage set/get test finally failed!');
                        finally_failed();
                    }
                };

                const success = () => {
                    if (to) {
                        clear();
                        resolve();
                    }
                };

                const finally_failed = () => {
                    if (to) {
                        clear();
                        reject();
                    }
                };

                let to: number | null = setTimeout(() => {
                    to = null;
                    finally_failed();
                }, STORAGE_ROUNDTRIP_TIMEOUT);

                const test = () => {
                    console.log('Storage: test -> start');

                    const start = Date.now();
                    storage.local.set(o, () => {
                        console.log('Storage: test -> set after ' + (Date.now() - start) + 'ms');
                        storage.local.get(k, (d: any) => {
                            console.log('Storage: test -> get after ' + (Date.now() - start) + 'ms');

                            if (!d || !d[k]) {
                                return failed('read value is' + JSON.stringify(d));
                            } else if (d[k].value !== b) {
                                return failed('read value is different ' + JSON.stringify(d[k])  + ' != ' + JSON.stringify(b));
                            } else if (runtime.lastError) {
                                return failed(runtime.lastError && runtime.lastError.message || 'lastError is set');
                            }

                            storage.local.remove(k, () => {
                                console.log('Storage: test -> remove after ' + (Date.now() - start) + 'ms');
                                success();
                            });
                        });
                    });
                };

                test();
            });
        }
    };

    return {
        init: async () => {
            if (!initialized) {
                initialized = true;
                const initCache = (items: LocalStorageObject) => {
                    cacheDB = {};
                    if (items) Object.keys(items).forEach(k => {
                        // new style (with origin and value) or old style entry?
                        const p = items[k] as LocalStorageValue | Storable;
                        // eslint-disable-next-line no-prototype-builtins
                        if (p && p.hasOwnProperty('origin') && p.hasOwnProperty('value')) {
                            cacheDB[k] = (<LocalStorageValue>p).value;
                        } else {
                            cacheDB[k] = <Storable>p;
                        }
                    });
                };
                await new Promise<void>(resolve => storage.local.get(null, (o) => {
                    initCache(o);
                    resolve();
                }));
            }
        },
        clean: async () => {
            initialized = false;
            cacheDB = {};
        },
        options: {},
        methods: me
    };
})();

let current: ExtensionStorage;

const implementations: { [ key: string]: StorageImplementation } = {
    chromeStorage
};

const isWorking = async (): Promise<void> => {
    if (!current) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(async () => {
                try {
                    await isWorking();
                    resolve();
                } catch (e) {
                    reject();
                }
            }, 1000);
        });
    } else {
        return (current.isWorking || Promise.resolve)();
    }
};

const self: AllStorages & { init: () => void } = {
    secure: {},
    setValue: (uename: string, value: Storable) => current.setValue(uename, value),
    setValues: (values: any) => current.setValues(values),
    getValue: (uename: string, defaultValue?: Storable) => current.getValue(uename, defaultValue),
    deleteAll: () => current.deleteAll(),
    deleteValue: (uename: string) => current.deleteValue(uename),
    listValues: () => current.listValues(),
    isWorking,
    migrate: async (f, t, opts) => {
        const from: StorageImplementation = implementations[f];
        const to: StorageImplementation = implementations[t];
        const options = opts || {};

        if (!from || !to) {
            const e = 'Migration: unknown storage implementation(s) ';
            console.error(e, f, t);
            throw e;
        } else {
            if (SV) console.debug('Migration: from', f, 'to', t);

            await call(f, 'init');
            await call(t, 'init');

            await Promise.all(from.methods.listValues().map(async name => {
                const value = from.methods.getValue(name);
                if (options.drop) {
                    await from.methods.deleteValue(name);
                }
                if (SV) console.debug('Migration: copy value of ' + name);
                if (value !== undefined) {
                    await to.methods.setValue(name, value);
                }
            }));

            await call(t, 'clean');
            await call(f, 'clean');
        }
    },
    init: async () => {
        console.debug('Storage: use ' + STORAGE);
        const s = implementations[STORAGE];
        current = s.methods;
        if (s.init) await s.init();
    },
    factoryReset: () => {
        return self.deleteAll();
    },
    isWiped: async (): Promise<boolean> => {
        return false;
    },
    setVersion: async (version, schema) => {
        await self.setValue(KEY_VERSION, version);
        if (schema) await self.setValue(KEY_SCHEMA, schema);
    },
    getVersion: async (dflt) => {
        return (await self.getValue(KEY_VERSION) as string | undefined) || dflt;
    },
    getSchemaVersion: () => {
        // DB specific version that allows TME to migrate every DB
        //    independet from the other DB types
        return self.getValue(KEY_SCHEMA, '1.0') as string;
    }
};

const Storage = self;

export default Storage;
