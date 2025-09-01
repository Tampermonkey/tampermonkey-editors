// WebSocket Communication Types

export interface WebSocketMessage {
    method: string;
    [key: string]: unknown;
}


export interface WebSocketMethodMessage extends WebSocketMessage {
    method: 'authOK' | 'ping' | 'pong';
}

export interface WebSocketAuthMessage extends WebSocketMessage {
    method: 'auth';
    token: string;
}

export interface WebSocketClosedMessage extends WebSocketMessage {
    method: 'closed';
    reason: string;
}

export interface WebSocketActionMessage extends WebSocketMessage {
    action: 'list' | 'get' | 'set' | 'patch';
    messageId: string;
    [key: string]: unknown;
}

export type WebSocketIncomingMessage =
    | WebSocketAuthMessage
    | WebSocketMethodMessage
    | WebSocketClosedMessage
    | WebSocketActionMessage
    | WebSocketMessage;


export interface WebSocketResponse {
    id: string;
    response: unknown;
}

export type WebSocketOutgoingMessage =
    | WebSocketAuthMessage
    | WebSocketMethodMessage
    | WebSocketResponse
    | WebSocketMessage;
