/// <reference lib="dom" />
/// <reference types="chrome" />

export const NATIVE_HOST = 'net.tampermonkey.editors_mcp';
export function isNativePopup(sender: { id?: string; tab?: unknown; url?: string }, runtime: { id: string; getURL: (path: string) => string }): boolean {
    return sender.id === runtime.id && !sender.tab && sender.url === runtime.getURL('popup.html');
}
const alarm = 'ReconnectNativeEditor';
const maxMessage = 1024 * 1024;
type Port = Pick<chrome.runtime.Port, 'postMessage' | 'disconnect' | 'onMessage' | 'onDisconnect'>;
type Grant = { version: 1; write: boolean };
type Command = { action: 'list' } | { action: 'get'; path: string } |
    { action: 'patch'; path: string; value: string; lastModified: number };
type Dependencies = {
    load: () => Promise<unknown>;
    save: (grant: Grant | null) => Promise<void>;
    permitted: () => Promise<boolean>;
    connect: () => Port;
    schedule: (name: string, minutes: number) => Promise<void>;
    clear: (name: string) => Promise<unknown>;
    execute: (command: Command) => Promise<unknown>;
    timeout?: number;
};
function object(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function command(value: unknown, write: boolean): Command {
    if (!object(value)) throw new Error('Invalid command');
    const keys = Object.keys(value);
    if (value.action === 'list' && keys.length === 1) return { action: 'list' };
    if (typeof value.path !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\/source$/i.test(value.path)) throw new Error('Only existing userscript source is available');
    if (value.action === 'get' && keys.length === 2) return { action: 'get', path: value.path };
    if (value.action === 'patch' && keys.length === 4 && write && typeof value.value === 'string' &&
        new TextEncoder().encode(value.value).length <= 512 * 1024 && typeof value.lastModified === 'number' &&
        Number.isFinite(value.lastModified) && value.lastModified >= 0) {
        return { action: 'patch', path: value.path, value: value.value, lastModified: value.lastModified };
    }
    throw new Error('Command is unsupported or source updates have not been approved');
}

export class NativeEditor {
    private dependencies: Dependencies;
    private initialized: Promise<void>;
    private grant: Grant | null = null;
    private port: Port | null = null;
    private ready = false;
    private starting = false;
    private epoch = 0;
    private failures = 0;
    private timer: ReturnType<typeof setTimeout> | undefined;
    private writes: Promise<void> = Promise.resolve();
    private cleanup: (() => void) | undefined;

    constructor(dependencies: Dependencies) {
        this.dependencies = dependencies;
        this.initialized = dependencies.load().then(value => {
            if (object(value) && value.version === 1 && typeof value.write === 'boolean' && Object.keys(value).length === 2) {
                this.grant = { version: 1, write: value.write };
            }
        });
    }
    status() { return { enabled: !!this.grant, connected: this.ready, write: !!this.grant?.write } }
    private save(grant: Grant | null) {
        const write = this.writes.catch(() => undefined).then(() => this.dependencies.save(grant));
        this.writes = write; return write;
    }
    private close() {
        ++this.epoch;
        clearTimeout(this.timer); this.cleanup?.(); this.cleanup = undefined;
        const port = this.port; this.port = null; this.ready = false; this.starting = false;
        try { port?.disconnect() } catch { /* The browser may have closed it already. */ }
    }
    private async retry() {
        if (this.grant) await this.dependencies.schedule(alarm, [0.5, 1, 2, 5][Math.min(this.failures++, 3)]);
    }
    async enable(write: boolean) {
        await this.initialized;
        const requestedEpoch = this.epoch;
        if (!await this.dependencies.permitted()) throw new Error('Native messaging permission is required');
        if (requestedEpoch !== this.epoch) return;
        this.close();
        const epoch = this.epoch;
        const grant: Grant = { version: 1, write };
        await this.save(grant);
        if (epoch !== this.epoch) return;
        this.grant = grant; this.failures = 0;
        await this.restore();
    }
    async disable() {
        await this.initialized;
        this.close(); this.grant = null; this.failures = 0;
        await this.dependencies.clear(alarm); await this.save(null);
    }
    async restore() {
        await this.initialized;
        if (!this.grant || this.port || this.starting) return;
        this.starting = true;
        const epoch = this.epoch;
        try {
            if (!await this.dependencies.permitted()) { await this.disable(); return }
            if (epoch !== this.epoch || !this.grant) return;
            await this.dependencies.clear(alarm);
            if (epoch !== this.epoch || !this.grant) return;
            const port = this.dependencies.connect(); this.port = port;
            let queued = 0;
            let chain = Promise.resolve();
            const ids = new Set<string>();
            const active = () => this.port === port && this.epoch === epoch;
            const failed = () => {
                if (!active()) return;
                this.close(); void this.retry().catch(() => undefined);
            };
            const reply = (id: string, response: unknown) => {
                if (!active()) return;
                const value = { type: 'response', id, response: object(response) ? response : { error: { number: 500, message: 'Invalid editor response' } } };
                if (new TextEncoder().encode(JSON.stringify(value)).length > maxMessage) value.response = { error: { number: 413, message: 'Native response exceeds the size limit' } };
                try { port.postMessage(value) } catch { failed() }
            };
            const onMessage = (value: unknown) => {
                if (!active() || !object(value)) { failed(); return }
                if (value.type === 'ready' && value.protocol === 1 && !this.ready && Object.keys(value).length === 2) {
                    clearTimeout(this.timer); this.ready = true; this.failures = 0; return;
                }
                if (!this.ready || value.type !== 'request' || typeof value.id !== 'string' || value.id.length > 64 || !value.id || Object.keys(value).length !== 3) { failed(); return }
                const id = value.id;
                if (queued >= 32 || ids.has(id)) { failed(); return }
                ++queued; ids.add(id);
                chain = chain.then(async () => {
                    if (!active() || !this.grant) return;
                    try {
                        const checked = command(value.command, this.grant.write);
                        reply(id, await this.dependencies.execute(checked));
                    } catch (error) {
                        reply(id, { error: { number: 403, message: error instanceof Error ? error.message : 'Native editor request failed' } });
                    }
                }).finally(() => { --queued; ids.delete(id) });
            };
            port.onMessage.addListener(onMessage);
            port.onDisconnect.addListener(failed);
            this.cleanup = () => { port.onMessage.removeListener(onMessage); port.onDisconnect.removeListener(failed) };
            this.timer = setTimeout(failed, this.dependencies.timeout ?? 8000);
            port.postMessage({ type: 'hello', protocol: 1, write: this.grant.write });
        } catch {
            if (epoch === this.epoch) { this.close(); await this.retry() }
        } finally { if (epoch === this.epoch) this.starting = false; }
    }
    onAlarm(name: string) { if (name === alarm) return this.restore(); }
}
