import { CloneInto, CreateObjectIn, ExportFunction } from './definitions';

const that = typeof globalThis === 'undefined' ? {} : globalThis as any;

export const cloneInto: CloneInto = that.cloneInto || ((object, _targetScope, _options) => {
    // options = { cloneFunctions: false, wrapReflectors: false }
    return object;
});

export const createObjectIn: CreateObjectIn = that.createObjectIn || ((obj, options) => {
    const no = {} as any;

    const defineAs = options && options.defineAs;
    if (defineAs) {
        obj[defineAs] = no;
    }

    return no;
});

export const exportFunction: ExportFunction = that.exportFunction || ((func, targetScope, options) => {
    // options = { defineAs: false, allowCallbacks: false }
    const defineAs = options && options.defineAs;

    if (defineAs) {
        targetScope[defineAs] = func;
    }
    return func;
});