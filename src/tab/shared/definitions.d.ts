import { Merge } from '../../types/shared';

export type TargetScope = Document | Window | typeof self | typeof globalThis | Window & typeof globalThis;
export type CloneInto = <T>(d: T, w: TargetScope, options?: {
    cloneFunctions?: boolean,
    wrapReflectors?: boolean
}) => T;
export type ExportFunction = <T extends S[K], K extends string, S extends Merge<TargetScope, Record<K, T>>>(func: T, targetScope: S, options?: {
    defineAs?: K,
    allowCallbacks?: boolean
}) => T;
export type CreateObjectIn = <T>(obj: T, options?: { defineAs?: keyof T }) => Record<string | number | symbol, unknown>;

export type ffTHis = {
    cloneInto?: CloneInto | undefined,
    exportFunction?: ExportFunction | undefined,
    createObjectIn?: CreateObjectIn | undefined
};
