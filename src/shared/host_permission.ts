
let hpp: boolean | undefined;
const { permissions, runtime } = chrome;

export const hasHostPermission = async (url: string): Promise<boolean> => {
    if (hpp === undefined) {
        hpp = await new Promise<boolean>(resolve => {
            permissions.contains({
                origins: [ url ]
            }, (result: boolean) => resolve(result));
        });
    }
    return hpp;
};


const manifest = runtime.getManifest();
const { host_permissions: hp, permissions: p } = manifest;
const origins = (p || [])
.concat(hp || [])
.filter((p: string) => p.startsWith('https://') || p.startsWith('http://') || p.startsWith('*://'));

export const requestHostPermission = async (): Promise<boolean> => {
    let result = (await permissions.request({origins})) as any as boolean; // TS is wrong. This IS boolean: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/request
    if (runtime.lastError) {
        console.error(runtime.lastError);
    }
    return result;
};
