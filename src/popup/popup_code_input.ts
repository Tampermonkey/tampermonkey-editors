/// <reference types="chrome" />
import { hasHostPermission, requestHostPermission } from '../shared/host_permission';
import { WebSocketConnectResponse } from '../types/extension';

const { runtime } = chrome;

const MIN_PORT_OFFSET = 1024;

function splitCode(code: string): { auth: string; port: number } | null {
    if (code.length < 3) return null;
    const auth = code.slice(-2);
    const portStr = code.slice(0, -2);
    if (!/^[a-zA-Z0-9]+$/.test(portStr)) return null;
    const port = parseInt(portStr, 32) + MIN_PORT_OFFSET;
    if (isNaN(port)) return null;
    return { auth, port };
}

function connect(authorization: string, port: number) {
    runtime.sendMessage({
        method: 'connectWebSocket',
        args: { authorization, port }
    }, (response: WebSocketConnectResponse) => {
        const feedback = document.getElementById('result') as HTMLDivElement;
        if (response.ok) {
            feedback.textContent = `WebSocket connection initiated.`;
        } else {
            feedback.textContent = `Error: ${response.error}`;
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {

    const openOnline = document.getElementById('openOnline') as HTMLButtonElement;
    openOnline.disabled = true;

    const vscodeConf = await runtime.sendMessage({ method: 'vscodeDevConfig' });

    let hpp = await hasHostPermission(vscodeConf.host);

    openOnline.disabled = false;
    openOnline.addEventListener('click', async () => {
        // browser rules: First thing before waiting must be requesting for permission
        hpp = hpp || await requestHostPermission();
        if (!hpp) {
            return;
        }
        runtime.sendMessage({ method: 'openOnlineEditor' });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('code') as HTMLInputElement;
    const form = input.form as HTMLFormElement;

    function connectWithCode(code: string) {
        const res = splitCode(code);
        if (res) {
            connect(res.auth, res.port);
        }
    }

    input.addEventListener('input', () => {
        const value = input.value;
        if (/^[a-zA-Z0-9]{5,}$/.test(value)) {
            connectWithCode(value);
        }
    });

    document.addEventListener('paste', (e: ClipboardEvent) => {
        const paste = (e.clipboardData as any).getData('text');
        if (/^[a-zA-Z0-9]{3,}$/.test(paste)) {
            connectWithCode(paste);
            e.preventDefault();
            input.value = paste;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        connectWithCode(input.value);
    });

});
