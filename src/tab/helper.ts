export function runOnDOMContentLoaded(capture?: boolean, callback?: () => void): Promise<void>;
export function runOnDOMContentLoaded(callback?: () => void): Promise<void>;
export function runOnDOMContentLoaded(captureOrCb?: (() => void) | boolean, callback?: () => void): Promise<void> {
    let capture = true;
    let cb: (() => void) | undefined;

    if (typeof captureOrCb == 'boolean') {
        capture = captureOrCb;
        cb = callback;
    } else {
        cb = captureOrCb;
    }

    return new Promise<void>(resolve => {
        const drs = window.document.readyState;

        if (drs == 'interactive' || drs == 'complete') {
            if (cb) cb();
            resolve();
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                if (cb) cb();
                resolve();
            }, { capture, once: true });
        }
    });
}

export const collectionHas = (a: NodeListOf<Element> | NodeList, b: Node): boolean => { //helper function (see below)
    for (let i = 0, len = a.length; i < len; i ++) {
        if (a[i] === b) return true;
    }
    return false;
};

export const queueMicrotask = async (cb: () => void): Promise<void> => {
    await null;
    cb();
};