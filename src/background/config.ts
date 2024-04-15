import { logger as console, LogLevel } from '../../src/shared/logger';
import Storage, { KEY_CONFIG, KEY_SESSION } from './storage';
import { arrayify } from '../shared/utils';
import { ExtensionIdsToTry, ExtensionIdToTry } from './find_tm';
import { Storable } from './types';
import { base64_decode, base64_encode } from './converter';
import { localStorage } from '../shared/environment';
import { short_id } from './browser';

export type ExtensionConfig = ExtensionPermanentConfig & ExtensionSessionConfig;

type ExtensionPermanentConfig = {
    logLevel: LogLevel,
    configMode: number,
    externalExtensionIds: ExtensionIdToTry[]
};

// eslint-disable-next-line @typescript-eslint/ban-types
type ExtensionSessionConfig = {};

export type ConfigKeys = keyof typeof defaults;
export type SessionKeys = keyof typeof session_defaults;
export type ConfigValue = string | number | boolean | Storable | string[] | null | undefined;
type ChangeListener = (name: string, oldvalue: ConfigValue, value: ConfigValue, promise?: Promise<void>) => void;

const changeListeners: { [config_value in (ConfigKeys | SessionKeys)]?: ChangeListener[] } = {};

const defaults: ExtensionPermanentConfig = {
    configMode: 0,
    logLevel: short_id === 'hohm' ? 100 : 0,
    externalExtensionIds: [ ...ExtensionIdsToTry ]
};

const session_defaults: ExtensionSessionConfig & Partial<ExtensionPermanentConfig> = {
};

const getPersistentValue = (name: ConfigKeys) => {
    let g = Storage.getValue(KEY_CONFIG, {}) as Partial<ExtensionPermanentConfig>;
    if (!(g instanceof Object)) g = {};

    let v;
    if ((v = g[name]) !== undefined) {
        return v;
    } else if (typeof (v = defaults[name]) == 'function') {
        return (v as (() => ConfigValue))();
    } else {
        return v;
    }
};

const setPersistentValue = (name: ConfigKeys, value: ConfigValue) => {
    let g = Storage.getValue(KEY_CONFIG, {}) as Partial<ExtensionPermanentConfig>;
    if (!(g instanceof Object)) g = {};

    const oldvalue = getPersistentValue(name) as ConfigValue;

    g[name] = value as any;
    const promise = Storage.setValue(KEY_CONFIG, g as Storable);

    const cl = changeListeners[name];
    if (cl && JSON.stringify(oldvalue) != JSON.stringify(value)) {

        cl.forEach(fn => {
            try {
                fn(name, oldvalue, value, promise);
            } catch (err) {
                console.warn('config: changeListener error', err);
            }
        });
    }

    return promise;
};

let session_values: Partial<ExtensionSessionConfig & ExtensionPermanentConfig> = {};

(() => {
    const ls = localStorage;
    let v: string | null;

    if (ls && (v = ls.getItem(KEY_SESSION))) {
        try {
            session_values = JSON.parse(base64_decode(v));
        } catch (e) {}
    }
})();

const getSessionValue = (name: SessionKeys) => {
    let v;
    return (v = session_values[name]) !== undefined ? v : session_defaults[name];
};

const setSessionValue = (name: SessionKeys | ConfigKeys, value: ConfigValue) => {
    const oldvalue = getSessionValue(name);

    if (value === undefined) {
        delete session_values[name];
    } else {
        session_values[name] = value as any;
    }

    if (localStorage) {
        localStorage.setItem(KEY_SESSION, base64_encode(JSON.stringify(session_values)));
    }

    const cl = changeListeners[name];

    if (cl && JSON.stringify(oldvalue) != JSON.stringify(value)) {
        cl.forEach(fn => {
            try {
                fn(name, oldvalue, value);
            } catch (err) {
                console.warn('config: changeListener error', err);
            }
        });
    }
};

const Config: {
    initialized: boolean,
    values: ExtensionConfig,
    snapshot: ExtensionConfig,
    init: () => Promise<void>,
    getValue: (name: ConfigKeys | SessionKeys) => ConfigValue,
    setValue: (name: ConfigKeys | SessionKeys, value: ConfigValue) => Promise<void>,
    getDefaults: () => ExtensionPermanentConfig,
    addChangeListener: (names: ConfigKeys | SessionKeys | (ConfigKeys | SessionKeys)[], cb: ChangeListener) => void
} = {
    initialized: false,
    values: {} as ExtensionConfig,
    snapshot: {} as ExtensionConfig,
    init: async (): Promise<void> => {
        const values = {} as Partial<ExtensionConfig>;

        Object.defineProperty(Config, 'snapshot', {
            get: function() { return { ...Config.values } /* FF doesn't like getters */ }, enumerable: true
        });

        (Object.keys(defaults) as ConfigKeys[]).forEach(k => {
            Object.defineProperty(values, k, {
                get: function() {
                    return getPersistentValue(k);
                },
                set: function(val) {
                    setPersistentValue(k, val); // set and check for change listeners
                },
                enumerable: true
            });
        });

        (Object.keys(session_defaults) as SessionKeys[]).forEach(k => {
            Object.defineProperty(values, k, {
                get: function() {
                    return getSessionValue(k);
                },
                set: function(val) {
                    setSessionValue(k, val); // set and check for change listeners
                },
                enumerable: true
            });
        });

        Config.values = values as ExtensionConfig;
        Config.initialized = true;
    },
    getValue: (name: ConfigKeys | SessionKeys): ConfigValue => {
        // eslint-disable-next-line no-prototype-builtins
        if (session_defaults.hasOwnProperty(name)) {
            return getSessionValue(name);
        } else {
            return getPersistentValue(name as ConfigKeys);
        }
    },
    setValue: async (name: ConfigKeys | SessionKeys, value: ConfigValue): Promise<void> => {
        // eslint-disable-next-line no-prototype-builtins
        if (session_defaults.hasOwnProperty(name)) {
            return await setSessionValue(name, value);
        } else {
            return await setPersistentValue(name as ConfigKeys, value);
        }
    },
    getDefaults: (): ExtensionPermanentConfig => {
        return defaults;
    },
    addChangeListener: (names: ConfigKeys | SessionKeys | (ConfigKeys | SessionKeys)[], cb: ChangeListener): void => {
        const ns = arrayify(names);

        ns.forEach(name => {
            let cl = changeListeners[name];
            if (!cl)  {
                cl = changeListeners[name] = [];
            }
            cl.push(cb);
        });
    }
};

export default Config;