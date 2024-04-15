/* eslint-disable tampermonkey/no-global-object-access */

import { setSleepyTimeout } from './utils';

export const getDocumentCookie = (): string => {
    return document && document.cookie || '';
};

export const setDocumentCookie = (c: string): void => {
    if (document) document.cookie = c;
};

export const useGlobalSleepyTimeout = (): void => {
    self.setTimeout = setSleepyTimeout as typeof self.setTimeout;
};

export const {
    AbortController,
    FileReader,
    TextDecoder,
    addEventListener,
    atob,
    btoa,
    clearInterval,
    clearTimeout,
    crypto,
    decodeURIComponent,
    encodeURIComponent,
    escape,
    fetch,
    location,
    removeEventListener,
    setInterval,
    setTimeout,
    unescape
} = self;

export const globalScope = self;
export const extensionOrigin = location.origin;
export const extensionDomain = location.host;

// not there in a service worker
export const {
    DOMParser,
    Notification,
    Image,
    Worker,
    XMLHttpRequest,
    alert,
    confirm,
    document,
    localStorage,
    screen
} = self as Partial<typeof self>;
