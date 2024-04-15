export type Storable = null | undefined | number | boolean | string | Storable[] | StorageObject;
export type StorageObject = {
    [key: string]: Storable
};

export type LocalStorageObject = {
    [key: string] : LocalStorageValue
};
export type LocalStorageOrigin = 'incognito' | 'normal';
export type LocalStorageValue = { origin: LocalStorageOrigin, value: Storable };

export type StorageChangeNamespace = 'local' | 'sync' | 'managed';

export type LocalStorageChangeValue = { origin: LocalStorageOrigin, value: Storable | undefined };