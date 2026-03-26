// Own Message Types

import { ConfigKeys, ExtensionConfig } from '../background/config';
import { BackgroundToContent, ContentToBackground } from './communication';

export interface WebSocketConnectRequest {
    method: 'connectWebSocket';
    args?: {
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
    | SetOptionRequest
    | GetOptionRequest
    | ContentToBackground;

export interface WebSocketConnectResponse {
    ok: boolean | null;
    error?: string;
}

export interface SetOptionRequest<T extends ConfigKeys = never> {
    method: 'setOption';
    args: { name: T; value: ExtensionConfig[T] };
}

export interface GetOptionRequest<T extends ConfigKeys = ConfigKeys> {
    method: 'getOption';
    args: { name: T; }
}

export interface GetOptionResponse<T extends ConfigKeys = ConfigKeys> {
    name: T;
    value: ExtensionConfig[T]
}

export type ExtensionResponseMessage =
    | WebSocketConnectResponse
    | GetOptionResponse
    | BackgroundToContent;
