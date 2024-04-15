export type True = true;
export type False = false;

export type Nullable<T> = T | null;
export type NoUndefined<T> = T extends undefined ? never : T;
export type RequiredKeys<T, K extends keyof T> = Exclude<T, K> & { [key in K]-?: Required<T[key]> };
export type Immutable<T> = { readonly [K in keyof T]: Immutable<T[K]> };
export type NoInfer<T> = [T][T extends any ? 0 : never];

export type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

export type OmitFrom<T, K> = Pick<T, Exclude<keyof T, keyof K>>;
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & {
        [K in Keys]-?:
            Required<Pick<T, K>>
            & Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys];

export type Flattened<T> = T extends Array<infer U> ? Flattened<U> : T;

export type Merge<T, U> = {
    [P in keyof T | keyof U] :
    | (T extends Partial<Record<P, any>> ? T[P] : never)
    | (U extends Partial<Record<P, any>> ? U[P] : never)
};

export type Arguments<T> = [T] extends [(...args: infer U) => any]
   ? U
   : [T] extends [void] ? [] : [T];