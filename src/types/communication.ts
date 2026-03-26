// #region content<->page

import { Bridge, BridgeMessage } from '../tab/bridge';
import { CreateExternalRequest, DeleteExternalRequest, GetExternalRequest, GetExternalResponse, ListExternalRequest, ListExternalResponse, OptionsExternalRequest, SetExternalRequest, UpdateExternalResponse, UserscriptsRequest } from './external';
import { OmitFrom } from './shared';

export type InternalErrorResponse = {
    error: string
};

export const isInternalErrorResponse = (message: any): message is InternalErrorResponse => message.error;

export type ContentPageBridgeToContent = BridgeMessage<'userscripts', ContentToBackground['args']>;
export type PageContentBridgeToPage = BridgeMessage<'userscripts', ListExternalResponse | GetExternalResponse | UpdateExternalResponse | InternalErrorResponse>;

// #endregion

// #region content<->background

export type ContentToBackground = BridgeMessage<
    'userscripts',
    OmitFrom<
        OptionsExternalRequest |
        ListExternalRequest |
        GetExternalRequest |
        SetExternalRequest |
        CreateExternalRequest |
        DeleteExternalRequest,
        UserscriptsRequest
    >
>;

export type BackgroundToContent =
    OptionsExternalRequest |
    ListExternalRequest |
    GetExternalRequest |
    SetExternalRequest |
    CreateExternalRequest |
    DeleteExternalRequest |
    InternalErrorResponse;
// #endregion

export type CoPaBridge<S, R> = Bridge<OmitFrom<S, UserscriptsRequest>, R>;
export type PaCoBridge<S extends Record<string, any>, R> = Bridge<S, BridgeMessage<'userscripts', OmitFrom<R, UserscriptsRequest>>>;

export type PageContentBridge = CoPaBridge<ListExternalRequest, ListExternalResponse | InternalErrorResponse> & CoPaBridge<GetExternalRequest, GetExternalResponse | InternalErrorResponse> & CoPaBridge<SetExternalRequest, UpdateExternalResponse | InternalErrorResponse>;
export type ContentPageBridge = PaCoBridge<GetExternalResponse | ListExternalResponse | UpdateExternalResponse | InternalErrorResponse, ListExternalRequest | GetExternalRequest | SetExternalRequest>;
