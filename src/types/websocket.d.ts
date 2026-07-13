// WebSocket Communication Types

import { ExternalRequest } from './external';

export interface WebSocketMessage {
    method: string;
}

export interface WebSocketMethodMessage extends WebSocketMessage {
    method: 'authOK' | 'ping' | 'pong';
    messageId: string;
}

export interface WebSocketAuthMessage extends WebSocketMessage {
    method: 'auth';
    token: string;
}

export interface WebSocketClosedMessage extends WebSocketMessage {
    method: 'closed';
    reason: string;
}

export type WebSocketIncomingMessage =
    | WebSocketAuthMessage
    | WebSocketMethodMessage
    | WebSocketClosedMessage
    | ExternalRequest;

export interface WebSocketResponse {
    id: string;
    response: unknown;
}

export type WebSocketOutgoingMessage =
    | WebSocketAuthMessage
    | WebSocketMethodMessage
    | WebSocketResponse
    | WebSocketMessage;
