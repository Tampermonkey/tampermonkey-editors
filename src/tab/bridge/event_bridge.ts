import { Bridge, MessageArgs, MessageData, MessageListener, MessageResponseCallback, Options } from '.';
import { runOnDOMContentLoaded } from '../helper';

const V = false;

export const createBridge = <S extends Record<string, any>, R>({ sendPrefix, listenPrefix, cloneInto }: Options): Bridge<S, R> => {
    const prepare = <T>(d: T) => cloneInto ? cloneInto(d, window.document) as T : d;

    const encode = (type: string, data: MessageData) => {
        const customEvent = new CustomEvent(type, {
            detail: prepare(data)
        });
        return customEvent;
    };

    let messageListener: MessageListener<any, any> | undefined;
    let response_id = 1;
    let id: string | undefined;

    const responses: Record<string, MessageResponseCallback> = {};

    const decode = (evt: CustomEvent): MessageData => evt.detail;
    const registerResponse = (cb: MessageResponseCallback) => {
        const id = ++response_id;
        responses[response_id] = cb;
        return id;
    };
    const handleResponse = (response_id: number, arg: MessageArgs) => {
        let f;
        if (response_id && (f = responses[response_id])) {
            f(arg);
            delete responses[response_id];
        }
    };
    const send = (sendId: string, obj: MessageData) => {
        const { m, a, r } = obj;
        const e = encode(sendId, { m, a, r });
        dispatchEvent.apply(window, [ e ]);
    };

    const eventListener = (e: CustomEvent) => {
        const { m, r, a } = decode(e);
        if (V) console.log('got', m, r, a);

        if (m == 'message.response') {
            if (r === null || r === undefined) throw 'Invalid Message';
            handleResponse(r, a);
        } else if (messageListener) {
            const sendResponse = r
                ? (ret: MessageArgs) => {
                    send(`${sendPrefix}_${id}`, { m: 'message.response', a: ret, r });
                }
                : () => undefined;

            messageListener({ method: m, args: a }, sendResponse);
        }
    };

    const setId = (new_id?: string) => {
        if (new_id) {
            id = new_id;
        }
        if (id) {
            addEventListener(`${listenPrefix}_${id}` as any, eventListener, true);
        }
    };

    const self = {
        init: async (new_id?: string) => {
            if (!id) {
                setId(new_id);
            } else {
                setId();
            }

            // wait for the document being closed, because only then existing event listeners are removed
            await runOnDOMContentLoaded();
        },
        refresh: () => {
            const oid = id;
            if (oid) {
                self.cleanup();
                self.init(oid);
            }
        },
        send: (method: string, arg?: Record<string, any>, cb?: ((response: any) => void) | null) => {
            send(`${sendPrefix}_${id}`, { m: method, a: arg, r: cb ? registerResponse(cb) : null });
        },
        setMessageListener: (m: MessageListener<R, S>) => {
            messageListener = m;
        },
        cleanup: () => {
            // might be called more than once!
            if (id) {
                removeEventListener(`${listenPrefix}_${id}` as any, eventListener, true);
                id = undefined;
            }
        }
    };

    return self;
};
