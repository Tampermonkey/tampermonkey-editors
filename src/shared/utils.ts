/**
 * @filename utils.ts
 * @author Jan Biniok <jan@biniok.net>
 */

import { setTimeout } from './environment';

const arrayify = <T>(s: T | T[]): T[] => Array.isArray(s) ? s : [ s ];

const sleep = (ms: number): Promise<void> => new Promise<void>(resolve => setSleepyTimeout(resolve, ms));

let lastSleep = 0;
const sleepEvery = (every: number, sleep?: number): Promise<void> | undefined => {
    const now = Date.now();
    if (lastSleep + every < now) {
        return new Promise(resolve => setTimeout(() => {
            lastSleep = Date.now();
            resolve();
        }, sleep || 0));
    }
};

const runAfterSleepEvery = async function(this: unknown, f: (...args: any[]) => any, ...rest: any[]): Promise<void> {
    await sleepEvery(1000);
    f.apply(this, rest);
};

// Note: does not work with clearImmediate!
const setImmediate = function(this: unknown, f: (...args: any[]) => any, ...rest: any[]): number {
    runAfterSleepEvery.apply(this, [ f, ...rest ]);
    return 0;
};

// fix setTimeout(() => any, 0);
const setSleepyTimeout = function(this: unknown, f: (...args: any[]) => any, t: number): number {
    if (!t) {
        runAfterSleepEvery.apply(this, [ f ]);
        return 0;
    } else {
        return setTimeout.apply(this, [ f, t ]) as unknown as number;
    }
};

const getRandomString = () => Math.random().toString(36).substr(2, 5);

export {
    getRandomString,
    arrayify,
    sleep,
    sleepEvery,
    setImmediate,
    setSleepyTimeout
};