import { WebSocketIncomingMessage } from '../types/websocket';

const D = true;

export class LocalWebSocketClient {
    private ws: WebSocket;
    public connected: Promise<this>;
    private resolveConnected!: (value: this) => void;
    private rejectConnected!: (reason?: Event | Error | string) => void;
    private messageListeners: Array<(msg: WebSocketIncomingMessage) => void> = [];

    constructor(auth: string, port: number) {
        const wsUrl = `ws://localhost:${port}`;
        this.connected = this._prepareConnection();

        let ws: WebSocket;
        try {
            ws = this.ws = new WebSocket(wsUrl);
        } catch (err) {
            this.rejectConnected(err as Error);
            throw err;
        }

        ws.onopen = async () => {
            const keepGoingAlarm = async (alarm: chrome.alarms.Alarm) => {
                if (alarm.name !== 'KeepWebsocketAlive') return;
                if (D) console.debug('Websocket keepAlive PING');

                const off = async () => {
                    if (D) console.debug('Websocket keepAlive OFF');
                    await chrome.alarms.clear('KeepWebsocketAlive');
                    await chrome.alarms.onAlarm.removeListener(keepGoingAlarm);
                };

                if (ws.readyState == ws.CLOSED){
                    off();
                }

                try {
                    await this.connected;
                    if (!await chrome.alarms.get('KeepWebsocketAlive')) {
                        await chrome.alarms.create('KeepWebsocketAlive', {
                            delayInMinutes: 0.4,
                            periodInMinutes: 0.4
                        });

                        await chrome.alarms.onAlarm.addListener(keepGoingAlarm);
                        if (D) console.debug('Websocket keepAlive ON');

                    }
                } catch(e) {
                    off();
                }
            };

            await chrome.alarms.create('KeepWebsocketAlive', {
                delayInMinutes: 0.4,
                periodInMinutes: 0.4
            });
            await chrome.alarms.onAlarm.addListener(keepGoingAlarm);

            if (D) console.debug('Websocket keepAlive START');

            ws.send(JSON.stringify({ method: 'auth', token: auth[0] }));
        };

        ws.onerror = (err) => {
            this.rejectConnected(err);
            console.error('WebSocket error:', err);
            chrome.alarms.clear('KeepWebsocketAlive');
        };

        ws.onmessage = (event) => {
            try {
                const data: { method: string; token: string } = JSON.parse(event.data);
                if (data.method !== 'auth' || data.token !== auth[1]) {
                    console.error('WebSocket authentication failed', data.method, port);  // Not mentioning the auth purposefully
                    this.rejectConnected('Server Auth failed');
                    ws.close();
                }

                ws.onmessage = (event) => {
                    let msg: string | WebSocketIncomingMessage = event.data;
                    try {
                        msg = JSON.parse(event.data) as WebSocketIncomingMessage;
                    } catch {}
                    if (data.method === 'ping') {
                        if (D) console.debug('pong!');
                        return ws.send(JSON.stringify({ method: 'pong' }));
                    }
                    this.messageListeners.forEach(fn => fn(msg as WebSocketIncomingMessage));
                };

                ws.send(JSON.stringify({ method: 'authOK' }));

                this.resolveConnected(this);
                console.log('WebSocket: ready for messaging:');
            } catch (e) {
                this.rejectConnected(e as Error);
                throw e;
            }
        };

        ws.onclose = (event) => {
            let err = null;
            try{
                this.messageListeners.forEach(fn => fn({ method: 'closed', reason: 'WebSocket connection closed' }));
            } catch (e) {
                err = e;
                throw e;
            } finally {
                if (event?.code === 1000 || event?.code === 1001) {
                    if (D) console.info('WebSocket closed', event, err);
                    this._prepareConnection(new Error('Connection closed'));
                } else {
                    console.error('WebSocket failed:', event, err);
                    this._prepareConnection(new Error('Connection errored'));
                }
            }
        };

    }

    _prepareConnection(rejection?: Error) {
        this.rejectConnected?.(rejection);

        return this.connected = new Promise((resolve, reject) => {
            this.resolveConnected = resolve;
            this.rejectConnected = reject;
        });
    }


    public listen(listener: (msg: WebSocketIncomingMessage) => void) {
        this.messageListeners.push(listener);
    }

    public send(msg: string | Record<string, unknown>) {
        if (this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } else {
            throw new Error('WebSocket is not open');
        }
    }
}
