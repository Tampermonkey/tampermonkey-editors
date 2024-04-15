let p: Promise<any> | undefined;

export const lock = <T>(cb: () => Promise<any>): Promise<T> => {
    const check = async (): Promise<T> => {
        if (p) {
            try {
                await p;
            } catch (e) {}
        } else {
            p = cb();
            let r: T;

            try {
                r = await p;
            } catch (e) {
                p = undefined;
                throw e;
            }
            p = undefined;
            return r;
        }
        return check();
    };
    return check();
};