// Chrome Extension Message Types

export interface ChromeExtensionRequest {
    method: string;
    args?: Record<string, unknown>;
}

export interface WebSocketConnectRequest extends ChromeExtensionRequest {
    method: 'connectWebSocket';
    args: {
        authorization: string;
        port: number;
    };
}

export interface UserscriptsRequest extends ChromeExtensionRequest {
    method: 'userscripts';
    args: Record<string, unknown>;
}

export interface MethodRequest extends ChromeExtensionRequest {
    method: 'openOnlineEditor' | 'vscodeDevConfig';
}

export type ExtensionRequestMessage =
    | ChromeExtensionRequest
    | MethodRequest
    | UserscriptsRequest
    | WebSocketConnectRequest;


export interface WebSocketConnectResponse {
    ok: boolean;
    error?: string;
}

export interface VSCodeDevConfigResponse {
    host: string;
}

export type ExtensionResponseMessage =
    | WebSocketConnectResponse
    | VSCodeDevConfigResponse
    | Record<string, unknown>;
