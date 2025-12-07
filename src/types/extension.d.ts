// Own Message Types

import { BackgroundToContent, ContentToBackground } from './communication';

export interface WebSocketConnectRequest {
    method: 'connectWebSocket';
    args: {
        authorization: string;
        port: number;
    };
}

export interface MethodRequest {
    method: 'openOnlineEditor';
}

export type ExtensionRequestMessage =
    | MethodRequest
    | WebSocketConnectRequest
    | ContentToBackground;

export interface WebSocketConnectResponse {
    ok: boolean;
    error?: string;
}

export type ExtensionResponseMessage =
    | WebSocketConnectResponse
    | BackgroundToContent;
