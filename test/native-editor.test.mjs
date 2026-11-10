import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/background/native_editor.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2022 } }).outputText;
const { NativeEditor, isNativePopup } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const tick = () => new Promise(resolve => setImmediate(resolve));
const path = '11111111-1111-4111-8111-111111111111/source';
function event() {
    const listeners = new Set();
    return { addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn), emit: value => { for (const fn of [...listeners]) fn(value); }, listeners };
}
function fixture(grant = null) {
    const state = { grant, permitted: true, online: true, handshake: true, alarms: [], ports: [], calls: [], saves: [], permissionGate: null, saveGate: null };
    const deps = {
        load: async () => state.grant,
        save: async grant => { if (state.saveGate) await state.saveGate; state.grant = grant; state.saves.push(grant); },
        permitted: async () => { if (state.permissionGate) await state.permissionGate; return state.permitted; },
        connect: () => {
            if (!state.online) throw Error('No host');
            const port = { onMessage: event(), onDisconnect: event(), sent: [], closed: false,
                postMessage(value) { port.sent.push(value); if (value.type === 'hello' && state.handshake) queueMicrotask(() => port.onMessage.emit({ type: 'ready', protocol: 1 })); },
                disconnect() { port.closed = true; },
                lost() { port.closed = true; port.onDisconnect.emit(); },
            };
            state.ports.push(port); return port;
        },
        schedule: async (name, minutes) => { state.alarms = [{ name, minutes }]; }, clear: async () => { state.alarms = []; },
        execute: async command => { state.calls.push(command); return { value: 'source', lastModified: 123 }; },
        timeout: 30,
    };
    return { state, deps, client: new NativeEditor(deps) };
}

test('only the real popup can enable or expand native access', () => {
    const runtime = { id: 'official', getURL: file => 'moz-extension://test/' + file };
    const popup = { id: 'official', url: runtime.getURL('popup.html') };
    assert.equal(isNativePopup(popup, runtime), true);
    for (const sender of [{ ...popup, tab: { id: 1 } }, { ...popup, url: 'https://vscode.dev/' },
        { ...popup, id: 'other' }, {}, { id: 'official', url: runtime.getURL('content.js') }]) assert.equal(isNativePopup(sender, runtime), false);
});

test('native mode is off by default; explicit approval saves only nonsecret permissions', async () => {
    const { client, state } = fixture(); await client.restore(); assert.equal(state.ports.length, 0);
    await client.enable(false); await tick();
    assert.deepEqual(state.grant, { version: 1, write: false });
    assert.deepEqual(client.status(), { enabled: true, connected: true, write: false });
    assert.deepEqual(state.ports[0].sent[0], { type: 'hello', protocol: 1, write: false });
    await client.disable();
});

test('reconstructed browser reconnects using saved consent; concurrent startup events create one host', async () => {
    const { client, state, deps } = fixture({ version: 1, write: true });
    await Promise.all([client.restore(), client.restore(), client.restore()]); await tick();
    assert.equal(state.ports.length, 1); assert.equal(client.status().connected, true);
    const restarted = new NativeEditor(deps); await restarted.restore(); await tick();
    assert.equal(state.ports.length, 2); assert.equal(state.saves.length, 0);
    await client.disable(); await restarted.disable();
});

test('offline helper retries with capped backoff; helper restart reconnects without approval', async () => {
    const { client, state } = fixture({ version: 1, write: false }); state.online = false;
    for (const minutes of [0.5, 1, 2, 5, 5]) { await client.restore(); assert.equal(state.alarms[0].minutes, minutes); }
    state.online = true; await client.restore(); await tick(); assert.equal(client.status().connected, true);
    state.ports.at(-1).lost(); await tick(); assert.equal(state.alarms[0].minutes, 0.5);
    await client.onAlarm(state.alarms[0].name); await tick(); assert.equal(client.status().connected, true);
    assert.equal(state.saves.length, 0); await client.disable();
});

test('source-only policy enforces read-only consent and revision checks before forwarding', async () => {
    const { client, state } = fixture({ version: 1, write: false }); await client.restore(); await tick();
    let port = state.ports.at(-1);
    const requests = [ { action: 'patch', path, value: 'new', lastModified: 123 }, { action: 'delete', path },
        { action: 'get', path: path.replace('/source','/storage') }, { action: 'get', path } ];
    requests.forEach((command, n) => port.onMessage.emit({ type: 'request', id: String(n), command }));
    await tick(); assert.deepEqual(state.calls, [{ action: 'get', path }]);
    assert.equal(port.sent.filter(value => value.response?.error).length, 3);
    await client.enable(true); await tick(); port = state.ports.at(-1);
    port.onMessage.emit({ type: 'request', id: 'missing', command: { action: 'patch', path, value: 'new' } });
    port.onMessage.emit({ type: 'request', id: 'valid', command: { action: 'patch', path, value: 'new', lastModified: 123 } });
    await tick(); assert.equal(state.calls.length, 2); assert.equal(state.calls[1].lastModified, 123); await client.disable();
});

test('disable wins over a delayed permission check and an in-flight grant write', async () => {
    const { client, state } = fixture(); let release;
    state.permissionGate = new Promise(resolve => { release = resolve; });
    const enabling = client.enable(true); await tick(); await client.disable(); release(); await enabling;
    assert.equal(state.grant, null); assert.equal(state.ports.length, 0);
    state.permissionGate = null;
    state.saveGate = new Promise(resolve => { release = resolve; });
    const second = client.enable(true); await tick(); const disabling = client.disable(); await tick(); release();
    await Promise.all([second, disabling]); assert.equal(state.grant, null); assert.equal(state.ports.length, 0);
});

test('missing browser permission clears saved consent and closes the native port', async () => {
    const { client, state } = fixture({ version: 1, write: true }); state.permitted = false;
    await client.restore(); assert.equal(state.grant, null); assert.equal(state.ports.length, 0);
    await assert.rejects(client.enable(true)); assert.equal(state.grant, null);
});

test('handshake timeout and malformed messages close the host without executing commands', async () => {
    const { client, state } = fixture({ version: 1, write: true }); state.handshake = false;
    await client.restore(); await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal(state.ports[0].closed, true); assert.equal(state.alarms.length, 1);
    state.handshake = true; await client.restore(); await tick();
    state.ports.at(-1).onMessage.emit({ type: 'request', id: '', command: { action: 'list' } }); await tick();
    assert.equal(state.ports.at(-1).closed, true); assert.equal(state.calls.length, 0); await client.disable();
});
