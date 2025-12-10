<template>
<main class="popup container small">
    <!-- Header -->
    <header class="popup-header row align-v-center">
        <div class="col-xs-2 col-sm-1 header-icon-wrap">
            <img
            class="header-icon"
            src="/images/icon128.png"
            alt="Extension icon"
            />
        </div>
        <div class="col-xs-10 col-sm-11">
            <h1 class="popup-title">Tampermonkey Editors</h1>
            <p class="popup-subtitle">
                Quickly open VS Code online or connect to your local editor.
            </p>
        </div>
    </header>

    <!-- Actions -->
    <section class="row">
        <!-- Online editor -->
        <div class="col-xs-12 col-md-6">
            <div class="card">
                <h2 class="card-title">VS Code for Web</h2>
                <p class="card-text">
                    Open <code>vscode.dev</code> in a new tab.<br>No local setup required.
                </p>
                <button type="button" class="btn btn-primary" @click="openOnline">
                    Open vscode.dev
                </button>
            </div>
        </div>

        <!-- Local editor -->
        <div class="col-xs-12 col-md-6">
            <div class="card">
                <h2 class="card-title">Local editor via WebSocket</h2>
                <p class="card-text">
                    Paste or type your one-time code to connect to the local editor.
                </p>

                <form class="code-form" @submit.prevent="submit">
                    <label class="field">
                        <span class="field-label">Connection code</span>
                        <input
                        v-model="code"
                        @input="onInput"
                        autocomplete="off"
                        spellcheck="false"
                        class="field-input"
                        placeholder="Paste or type code…"
                        />
                    </label>
                    <div class="code-form-actions">
                        <button type="submit" class="btn btn-secondary">
                            Connect
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Status -->
        <div class="col-xs-12">
            <div class="status-card">
                <div class="status-header">
                    <span class="status-dot" :class="`status-dot--${status}`" />
                    <span class="status-label">
                        WebSocket status:
                        <strong>{{ statusText }}</strong>
                    </span>
                </div>
                <p class="status-message">{{ statusMessage }}</p>
            </div>
        </div>
    </section>

    <!-- Settings -->
    <section class="row">
        <div class="col-xs-12">
            <div class="card card-settings">
                <h2 class="card-title">Settings</h2>

                <div class="settings-row">
                    <label class="field">
                        <span class="field-label">Log level</span>
                        <select v-model.number="logLevel" class="field-input field-select" @change="onLogLevelChange">
                            <option v-for="level in LOG_LEVEL_OPTIONS" :key="level.value" :value="level.value">
                                {{ level.label }}
                            </option>
                        </select>
                    </label>
                </div>
            </div>
        </div>
    </section>
    </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { GetOptionRequest, GetOptionResponse, SetOptionRequest, WebSocketConnectResponse } from '../types/extension';
import { ExtensionConfig } from '../background/config';
import { LogLevel } from '../shared/logger';
import { sleep } from '../shared/utils';

const MIN_PORT_OFFSET = 1024;
const code = ref('');

// --- WebSocket status handling ---
type Status = 'idle' | 'connecting' | 'connected' | 'error';

const status = ref<Status>('idle');
const statusMessage = ref('Waiting for connection.');

const statusText = computed(() => {
    switch (status.value) {
        case 'connecting':
        return 'Connecting…';
        case 'connected':
        return 'Connected';
        case 'error':
        return 'Error';
        default:
        return 'Idle';
    }
});

// --- Log level handling ---
const ERROR = 0;
const WARN = 30;
const DEBUG = 60;
const VERBOSE = 80;

const LOG_LEVEL_OPTIONS = [
{ label: 'Errors only', value: ERROR },
{ label: 'Warnings & errors', value: WARN },
{ label: 'Debug', value: DEBUG },
{ label: 'Verbose', value: VERBOSE }
] as const;

const logLevel = ref<number | null>(null);

async function loadLogLevel() {
    const stored = await getOptionRequest('logLevel');
    if (typeof stored === 'number') {
        logLevel.value = stored;
    } else {
        logLevel.value = WARN;
    }
}

const runtime = chrome.runtime;

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
    status.value = 'connecting';
    statusMessage.value = `Connecting to local editor (port ${port})…`;

    runtime.sendMessage(
        { method: 'connectWebSocket', args: { authorization, port } },
        (response: WebSocketConnectResponse) => {
            if (response?.ok) {
                status.value = 'connected';
                statusMessage.value = 'WebSocket connection initiated.';
            } else {
                status.value = 'error';
                statusMessage.value =
                'Error while connecting: ' + (response?.error ?? 'Unknown error');
            }
        }
    );
}

function getState() {
    runtime.sendMessage(
        { method: 'connectWebSocket' },
        (response: WebSocketConnectResponse) => {
            if (!response) {
                status.value = 'error';
                statusMessage.value = 'Error while connecting: Unknown error';
            } else if (response.ok) {
                status.value = 'connected';
                statusMessage.value = 'WebSocket connection initiated.';
            } else if (response.ok == null) {
                status.value = 'idle';
                statusMessage.value = 'WebSocket not connected.';
            } else {
                status.value = 'error';
                statusMessage.value =
                'Error while connecting: ' + (response?.error ?? 'Unknown error');
            }
        }
    );
}

function connectWithCode(codeValue: string) {
    const res = splitCode(codeValue);
    if (res) {
        connect(res.auth, res.port);
    } else {
        status.value = 'error';
        statusMessage.value = 'The code format is invalid.';
    }
}

function onInput() {
    const value = code.value;
    if (/^[a-zA-Z0-9]{5,}$/.test(value)) {
        connectWithCode(value);
    } else {
        // reset status when user edits to something clearly incomplete
        status.value = 'idle';
        statusMessage.value = 'Waiting for connection.';
    }
}

function submit() {
    connectWithCode(code.value);
}

function openOnline() {
    runtime.sendMessage({ method: 'openOnlineEditor' });
}

function createSetOptionRequest<T extends keyof ExtensionConfig>(
    name: T,
    value: ExtensionConfig[T]
): SetOptionRequest<T> {
    return {
        method: 'setOption',
        args: { name, value }
    };
}

function getOptionRequest<T extends keyof ExtensionConfig> (
    name: T
): Promise<ExtensionConfig[T]> {
    return new Promise(resolve => {
        runtime.sendMessage<GetOptionRequest, GetOptionResponse<T>>({
            method: 'getOption',
            args: { name }
        }, (i) => resolve(i.value as ExtensionConfig[T]));
    });
}

function onLogLevelChange() {
    const payload = createSetOptionRequest('logLevel', logLevel.value as LogLevel);
    runtime.sendMessage(payload);
}

onMounted(async () => {
    document.addEventListener('paste', (e: ClipboardEvent) => {
        const text = e.clipboardData?.getData('text') ?? '';
        if (/^[a-zA-Z0-9]{3,}$/.test(text)) {
            e.preventDefault();
            code.value = text;
            connectWithCode(text);
        }
    });

    await sleep(1); // wait for the DOM to be ready

    loadLogLevel();
    getState();
});
</script>

<style lang="scss">
$device-xs: 400px;
$device-sm: 768px;
$device-md: 992px;
$device-lg: 1200px;

.popup {
    padding: 0.75rem 0 1rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
    color: #111827;
}

.popup-header {
    margin-bottom: 0.75rem;
    padding: 0.75rem 0.75rem;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #1f2937, #111827);
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.35);
}

.header-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-icon {
    width: 32px;
    height: 32px;
    border-radius: 0.75rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
}

.popup-title {
    font-size: 1.05rem;
    margin: 0 0 0.1rem;
    color: #f9fafb;
}

.popup-subtitle {
    margin: 0;
    font-size: 0.8rem;
    color: #d1d5db;
}

/* Cards */

.card {
    background: #ffffff;
    border-radius: 0.75rem;
    padding: 0.75rem 0.85rem;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.3);
}

.card + .card {
    margin-top: 0.5rem;
}

.card-title {
    margin: 0 0 0.35rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: #111827;
}

.card-text {
    margin: 0 0 0.6rem;
    font-size: 0.8rem;
    color: #4b5563;
}

.card-settings {
    margin-top: 0.5rem;
}

/* Status card */

.status-card {
    background: #0f172a;
    border-radius: 0.75rem;
    padding: 0.7rem 0.85rem;
    color: #e5e7eb;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.4);
    border: 1px solid #1f2937;
    font-size: 0.8rem;
}

.status-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.25rem;
}

.status-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    display: inline-block;
    background: #6b7280;
}

.status-dot--idle {
    background: #6b7280;
}

.status-dot--connecting {
    background: #f59e0b;
}

.status-dot--connected {
    background: #22c55e;
}

.status-dot--error {
    background: #ef4444;
}

.status-label {
    font-weight: 500;

    &, & > * {
        color: lightgray;
    }
}

.status-message {
    margin: 0;
    color: #9ca3af;
}

/* Form / fields */

.code-form {
    margin-top: 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* button row */
.code-form-actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

/* From device-md upwards: field + button side-by-side */
@media (min-width: $device-sm) {
    .code-form {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
    }

    .code-form .field {
        flex: 1 1 auto;      // now it's width-based because flex-direction is row
    }

    .code-form-actions {
        width: auto;
        margin-top: 0;
        justify-content: flex-start;
    }
}

/* Field */

.field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-width: 100%;
}

/* On wider screens: label + input inline */
@media (min-width: $device-xs) {
    .field {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
    }

    .field-label {
        min-width: 120px;
        white-space: nowrap;
    }

    .field-input {
        flex: 1 1 auto;
    }
}

.field-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
}

.field-input {
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    padding: 0.35rem 0.5rem;
    font-size: 0.8rem;
    outline: none;
    background-color: #f9fafb;
    transition: border-color 0.15s ease, box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.field-input:focus {
    border-color: #3b82f6;
    background-color: #ffffff;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
}

.field-select {
    padding-right: 1.6rem;
}

/* Buttons */

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    border-radius: 999px;
    border: none;
    padding: 0.35rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.08s ease-out, box-shadow 0.1s ease,
    background-color 0.1s ease, opacity 0.1s ease;
    user-select: none;
}

.btn-primary {
    background: #2563eb;
    color: #f9fafb;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.btn-primary:hover {
    background: #1d4ed8;
}

.btn-secondary {
    background: #e5e7eb;
    color: #111827;
}

.btn-secondary:hover {
    background: #d4d4d8;
}

.btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(15, 23, 42, 0.25);
}

/* Settings */

.settings-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.25rem;
}

/* here we DO want flex-based width for fields */
.settings-row .field {
    flex: 1 1 220px;
}

code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
    font-size: 0.78rem;
    background-color: #f3f4f6;
    padding: 0.05rem 0.25rem;
    border-radius: 0.25rem;
}
</style>
