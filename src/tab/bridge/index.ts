import { NoInfer } from '../../types/shared';
import { createBridge as createEventBridge} from './event_bridge';

export type Bridge<S extends Record<string, any>, R> = {
    init: (new_id?: string) => void;
    send: <T extends Record<string, any> = S, M = R>(method: string, args?: NoInfer<T>, cb?: ((response: M) => void) | null) => void;
    setMessageListener: (m: MessageListener<NoInfer<R>, S>) => void;
    cleanup: () => void;
};

export type BridgeSender = (id: string, e: MessageData) => void;
export type BridgeOnMessageListener = (id: string, e: MessageData) => void;
export type BridgeRegisterOnMessage = (listener: BridgeOnMessageListener) => void;
export type BridgeMessage<M = unknown, A = unknown> = {
    method: M;
    args: A;
};

export type Options = {
    listenPrefix: string,
    sendPrefix: string,
    cloneInto?: (<T>(d: T, w: Document) => T),
    send?: BridgeSender,
    onMessage?: BridgeRegisterOnMessage
};

export type MessageData<M = unknown> = {
    m: M,
    a: MessageArgs,
    r: number | null // (ret: any) => void,
};

export type MessageArgs = any;

export type MessageListener<T, S> = (info: T, sendResponse: (a: S) => void) => false | void;

export type MessageResponseCallback = (a: MessageArgs) => void;

export {
    createEventBridge
};