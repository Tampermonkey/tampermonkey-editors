import { OmitFrom, RequiredKeys } from '../../types/shared';
import { Bridge } from '../bridge';
import {
    GetExternalRequest,
    GetExternalResponse,
    InternalErrorResponse,
    isInternalErrorResponse,
    ListExternalRequest,
    ListExternalResponse,
    ListExternalResponseListItem,
    SetExternalRequest,
    UpdateExternalResponse,
    UserscriptsRequest
} from './types';

const MAX_MESSAGE_TIMEOUT = 5000;
const MESSAGE_TIMEOUT = 15000;
const TIMEOUT_MESSAGE = 'Extension communication timed out!';

export const getScriptList = (bridge: Bridge<unknown>): Promise<ListExternalResponseListItem[]> => {
    return new Promise<ListExternalResponseListItem[]>((resolve) => {
        let int = 1;
        const schedule = () => {
            setTimeout(run, Math.min(int = (int * 2), MAX_MESSAGE_TIMEOUT));
        };
        const run = () => {
            bridge.send<OmitFrom<ListExternalRequest, UserscriptsRequest>, ListExternalResponse | InternalErrorResponse>('userscripts', { action: 'list' }, (response) => {
                if (!response || isInternalErrorResponse(response)) {
                    schedule();
                } else {
                    resolve(response.list as ListExternalResponseListItem[] /* no filter was set */);
                }
            });
        };
        run();
    });
};

export const getEntryContent = (bridge: Bridge<unknown>, path: string, ifNotModifiedSince?: number): Promise<RequiredKeys<Pick<GetExternalResponse, 'value' | 'lastModified'>, 'lastModified'>> => {
    return new Promise<RequiredKeys<Pick<GetExternalResponse, 'value' | 'lastModified'>, 'lastModified'>>((resolve, reject) => {
        const to = setTimeout(() => reject(new DOMException(TIMEOUT_MESSAGE)), MESSAGE_TIMEOUT);

        bridge.send<OmitFrom<GetExternalRequest, UserscriptsRequest>, GetExternalResponse | InternalErrorResponse>('userscripts', { action: 'get', path, ifNotModifiedSince }, (response) => {
            clearTimeout(to);
            if (!response || isInternalErrorResponse(response) || !response.lastModified) {
                reject(response?.error);
            } else {
                const { value, lastModified } = response;
                resolve({ value, lastModified });
            }
        });
    });
};

export const setEntryContent = (bridge: Bridge<unknown>, path: string, value: string, lastModified: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const to = setTimeout(() => reject(new DOMException(TIMEOUT_MESSAGE)), MESSAGE_TIMEOUT);

        bridge.send<OmitFrom<SetExternalRequest, UserscriptsRequest>, UpdateExternalResponse | InternalErrorResponse>('userscripts', { action: 'patch', path, value, lastModified }, (response) => {
            clearTimeout(to);

            if (!response || response.error) {
                reject(response?.error);
            } else {
                resolve();
            }
        });
    });
};