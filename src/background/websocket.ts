export class LocalWebSocketClient {
    private ws: WebSocket;
    public connected: Promise<this>;
    private resolveConnected!: (value: this) => void;
    private rejectConnected!: (reason?: any) => void;
    private messageListeners: Array<(msg: any) => void> = [];

    constructor(auth: string, port: number) {
        const wsUrl = `ws://localhost:${port}`;
        this.connected = new Promise(() => {}); // Appease the Typescript gods
        this._prepareConnection();
        try {
            this.ws = new WebSocket(wsUrl);
        } catch (err) {
            this.rejectConnected(err);
            throw err;
        }
        this.ws.onopen = async () => {
            // Needs some delay, otherwise, sometimes, the message is lost
            setTimeout(() => {
                this.ws.send(JSON.stringify({ method: 'auth', token: auth[0] }));
            }, 100);

            (async function (socket: LocalWebSocketClient) {

                async function keepGoingAlarm(alarm: any) {
                    if (alarm.name !== 'KeepWebsocketAlive') return;
                    console.debug('Websocket keepAlive PING');

                    async function off(){
                        console.debug('Websocket keepAlive OFF');
                        await chrome.alarms.clear('KeepWebsocketAlive');
                        await chrome.alarms.onAlarm.removeListener(keepGoingAlarm);
                    }

                    if (socket.ws.readyState == socket.ws.CLOSED){
                        off();
                    }

                    try {
                        await socket.connected;
                        if(!await chrome.alarms.get('KeepWebsocketAlive')){
                            await chrome.alarms.create('KeepWebsocketAlive', {
                                delayInMinutes: 0.4,
                                periodInMinutes: 0.4
                            });

                            await chrome.alarms.onAlarm.addListener(keepGoingAlarm);
                            console.debug('Websocket keepAlive ON');

                        }
                    } catch(e) {
                        off();
                    }
                }
                await socket.connected;
                await chrome.alarms.create('KeepWebsocketAlive', {
                    delayInMinutes: 0.4,
                    periodInMinutes: 0.4
                });
                await chrome.alarms.onAlarm.addListener(keepGoingAlarm);
                console.debug('Websocket keepAlive START');

            })(this);
        };
        this.ws.onerror = (err) => {
            this.rejectConnected(err);
            console.error('WebSocket error:', err);
            chrome.alarms.clear('KeepWebsocketAlive')
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.method !== 'auth' || data.token !== auth[1]) {
                    console.error('WebSocket authentication failed', data.method, port);  // Not mentioning the auth purposefully
                    this.rejectConnected('Server Auth failed');
                    this.ws.close();
                }

                this.ws.onmessage = (event) => {
                    let msg = event.data;
                    try {
                        msg = JSON.parse(event.data);
                    } catch {}
                    if (data.method === 'ping') {
                        console.debug('pong!');
                        return this.ws.send(JSON.stringify({ method: 'pong' }));
                    }
                    this.messageListeners.forEach(fn => fn(msg));
                };
                this.ws.send(JSON.stringify({ method: 'authOK' }));
                this.resolveConnected(this);
                console.log('Ready for messaging:');
            } catch (e) {
                this.rejectConnected(e);
                throw e;
            }
        };

        this.ws.onclose = (event: CloseEvent) => {
            let err = null;
            try{
                this.messageListeners.forEach(fn => fn({ method: 'closed', reason: 'WebSocket connection closed' }));
            } catch (e) {
                err = e;
                throw e;
            } finally {
                if (event?.code === 1000 || event?.code === 1001) {
                    console.info('WebSocket closed', event, err);
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

        this.connected = new Promise((resolve, reject) => {
            this.resolveConnected = resolve;
            this.rejectConnected = reject;
        });
    }


    public listen(listener: (msg: any) => void) {
        this.messageListeners.push(listener);
    }

    public send(msg: any) {
        if (this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } else {
            throw new Error('WebSocket is not open');
        }
    }
}
