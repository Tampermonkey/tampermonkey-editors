import { Arguments } from '../types/shared';

interface EventHandler {
    (...args: any[]): boolean | void
}

export default class EventEmitter<Events> {
    events: { [key in keyof Events]?: (Events[key])[] };

    constructor() {
        this.events = {};
    }

    on<E extends keyof Events>(event: E, listener: Events[E]): () => void {
        const { events } = this;
        let handlers = events[event];

        if (!handlers) {
            handlers = [];
            events[event] = handlers;
        }
        handlers.push(listener);

        return () => this.off(event, listener);
    }

    once<E extends keyof Events>(event: E, listener: Events[E]): () => void {
        const forward = (...args: any[]): boolean | void => {
            unregister();
            return (listener as unknown as EventHandler).bind(this)(...args);
        };

        const unregister = this.on(event, forward as unknown as Events[E]);
        return unregister;
    }

    off<E extends keyof Events>(event: E, listener: Events[E]): void {
        const handlers = this.events[event];

        if (handlers) {
            const i = handlers.indexOf(listener);
            if (i >= 0) handlers.splice(i, 1);
        }
    }

    emit<E extends keyof Events> (event: E, ...args: Arguments<Events[E]>): boolean {
        const handlers = this.events[event] as (Events[E])[];

        if (handlers) {
            for (const handle of handlers) {
                if ((handle as unknown as EventHandler)(...args)) {
                    return true;
                }
            }
        }

        return false;
    }
}
