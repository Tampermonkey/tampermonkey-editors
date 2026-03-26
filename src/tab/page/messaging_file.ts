import { AsyncFile } from '../../../vendor/file-system-access/adapters/memory';

export type ExternalHandler = {
    get: (name: string, path: string, ifModifiedSince?: number) => Promise<File>
    set: (name: string, path: string, file: File) => Promise<void>
};

export class MessagingFile extends AsyncFile {
    public name: string;
    public path: string;
    public handler: ExternalHandler;
    private cache: File | undefined;

    async get() {
        const f = await this.handler.get(this.name, this.path, this.cache?.lastModified);
        if (!this.cache?.lastModified || f.lastModified !== this.cache.lastModified) {
            this.cache = f;
        }
        return this.cache;
    }

    async set(f: File) {
        this.cache = f;
        await this.handler.set(this.name, this.path, f);
    }

    constructor (name: string, path: string, handler: ExternalHandler) {
        super();
        this.name = name;
        this.path = path;
        this.handler = handler;
    }
}