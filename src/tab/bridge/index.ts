import { NoInfer } from '../../types/shared';
import { createBridge as createEventBridge} from './event_bridge';

export type Bridge<R> = {
    init: (new_id?: string) => void;
    send: <T extends Record<string, any> = never, M = R>(method: string, args?: NoInfer<T>, cb?: ((response: M) => void) | null) => void;
    setMessageListener: <T = R>(m: MessageListener<NoInfer<T>, R>) => void;
    cleanup: () => void;
};

export type BridgeSender = (id: string, e: MessageData) => void;
export type BridgeOnMessageListener = (id: string, e: MessageData) => void;
export type BridgeRegisterOnMessage = (listener: BridgeOnMessageListener) => void;

export type Options = {
    listenPrefix: string,
    sendPrefix: string,
    cloneInto?: (<T>(d: T, w: Document) => T),
    send?: BridgeSender,
    onMessage?: BridgeRegisterOnMessage
};

export type MessageData = {
    m: string,
    a: MessageArgs,
    r: number | null // (ret: any) => void,
};

export type MessageArgs = any;

export type MessageListener<T, S> = (info: T, sendResponse: (a: S) => void) => false | void;

export type MessageResponseCallback = (a: MessageArgs) => void;

export {
    createEventBridge
};