type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
type Cast<X, Y> = X extends Y ? X : Y;
type FromEntries<T> = T extends [infer Key, any][]
    ? { [K in Cast<Key, string>]: Extract<ArrayElement<T>, [K, any]>[1]}
    : { [key in string]: any };

type FromEntriesWithReadOnly<T> = FromEntries<DeepWriteable<T>>;

declare global {
    interface ObjectConstructor {
        fromEntries<T>(obj: T): FromEntriesWithReadOnly<T>
    }
}

let fromEntries: <T>(iterable: T) => FromEntriesWithReadOnly<T>;

if (!Object.fromEntries) {
    fromEntries = <T>(iterable: T): FromEntriesWithReadOnly<T> => {
        return [...iterable as unknown as Iterable<readonly [PropertyKey, any]>].reduce((obj, [key, val]) => {
            (obj as any)[key] = val;
            return obj;
        }, {}) as FromEntriesWithReadOnly<T>;
    };

    Object.fromEntries = fromEntries;
} else {
    fromEntries = Object.fromEntries;
}

export { fromEntries, ArrayElement, FromEntriesWithReadOnly };