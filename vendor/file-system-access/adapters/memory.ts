/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Adapter, FileSystemFileHandleAdapter, FileSystemFolderHandleAdapter, WriteChunk } from '../interfaces';
import { errors, isChunkObject } from '../util';

const File = globalThis.File;
const Blob = globalThis.Blob;

const { INVALID, GONE, MISMATCH, MOD_ERR, SYNTAX, DISALLOWED } = errors;

class Sink implements UnderlyingSink<WriteChunk> {
    private fileHandle: FileHandle;
    private file: File;
    private size: number;
    private position: number;

    constructor (fileHandle: FileHandle, file: File, keepExistingData: boolean) {
        fileHandle.file!;
        this.fileHandle = fileHandle;
        this.file = keepExistingData ? file : new File([], file.name, file);
        this.size = keepExistingData ? file.size : 0;
        this.position = 0;
    }

    async write (chunk: WriteChunk) {
        if (!this.fileHandle.file) throw new DOMException(...GONE);

        let file = this.file;

        if (isChunkObject(chunk)) {
            if (chunk.type === 'write') {
                if (typeof chunk.position === 'number' && chunk.position >= 0) {
                    this.position = chunk.position;
                    if (this.size < chunk.position) {
                        this.file = new File(
                            [this.file, new ArrayBuffer(chunk.position - this.size)],
                            this.file.name,
                            this.file
                        );
                        if (emitter) emitter.emit('modified', this.fileHandle);
                    }
                }
                if (!('data' in chunk)) {
                    throw new DOMException(...SYNTAX('write requires a data argument'));
                }
                chunk = chunk.data;
            } else if (chunk.type === 'seek') {
                if (Number.isInteger(chunk.position) && chunk.position >= 0) {
                    if (this.size < chunk.position) {
                        throw new DOMException(...INVALID);
                    }
                    this.position = chunk.position;
                    return;
                } else {
                    throw new DOMException(...SYNTAX('seek requires a position argument'));
                }
            } else if (chunk.type === 'truncate') {
                if (Number.isInteger(chunk.size) && chunk.size >= 0) {
                    file = chunk.size < this.size
                        ? new File([file.slice(0, chunk.size)], file.name, file)
                        : new File([file, new Uint8Array(chunk.size - this.size)], file.name, file);

                    this.size = file.size;
                    if (this.position > file.size) {
                        this.position = file.size;
                    }
                    this.file = file;

                    if (emitter) emitter.emit('modified', this.fileHandle);
                    return;
                } else {
                    throw new DOMException(...SYNTAX('truncate requires a size argument'));
                }
            }
        }

        chunk = new Blob([chunk]);

        let blob = this.file;
        // Calc the head and tail fragments
        const head = blob.slice(0, this.position);
        const tail = blob.slice(this.position + chunk.size);

        // Calc the padding
        let padding = this.position - head.size;
        if (padding < 0) {
            padding = 0;
        }
        blob = new File([
            head,
            new Uint8Array(padding),
            chunk,
            tail
        ], blob.name);

        this.size = blob.size;
        this.position += chunk.size;

        this.file = blob;
        if (emitter) emitter.emit('modified', this.fileHandle);
    }

    async close () {
        if (!this.fileHandle.file) throw new DOMException(...GONE);
        this.fileHandle.file.set(this.file);
        this.file =
            this.position =
            this.size = null!;
        if (this.fileHandle.onclose) {
            this.fileHandle.onclose(this.fileHandle);
        }
    }
}

export class AsyncFile {
    public file: File;

    async get() {
        return this.file;
    }

    async set(f: File) {
        this.file = f;
    }

    constructor (name = '', file = new File([], name)) {
        this.file = file;
    }
}

export class FileHandle implements FileSystemFileHandleAdapter {
    public file: AsyncFile | null;
    public readonly name: string;
    public readonly kind = 'file';
    // TODO: check if we need this, b/c we can check file for null instead
    private deleted = false;

    public writable: boolean;
    public onclose?(self: this): void;

    constructor (name = '', file: File | AsyncFile = new AsyncFile(), writable = true) {
        this.file = file instanceof AsyncFile ? file : new AsyncFile(name, file);
        this.name = name;
        this.writable = writable;
        if (emitter) emitter.emit('created', this);
    }

    async getFile () {
        if (this.deleted || this.file === null) throw new DOMException(...GONE);
        return await this.file.get();
    }

    async createWritable (opts?: FileSystemCreateWritableOptions) {
        if (!this.writable) throw new DOMException(...DISALLOWED);
        if (this.deleted) throw new DOMException(...GONE);
        const file = await this.file!.get();
        return new Sink(this, file, !!opts?.keepExistingData);
    }

    async isSameEntry (other: FileHandle) {
        return this === other;
    }

    destroy () {
        if (emitter) emitter.emit('deleted', this);
        this.deleted = true;
        this.file = null;
    }
}

export class FolderHandle implements FileSystemFolderHandleAdapter {
    public readonly name: string;
    public readonly kind = 'directory';
    private deleted = false;
    public _entries: Record<string, FolderHandle | FileHandle>;
    public writable: boolean;

    constructor (name: string, writable = true) {
        this.name = name;
        this.writable = writable;
        this._entries = {};
        if (emitter) emitter.emit('created', this);
    }

    async * entries () {
        if (this.deleted) throw new DOMException(...GONE);
        yield* Object.entries(this._entries);
    }

    async isSameEntry (other: FolderHandle) {
        return this === other;
    }

    async getDirectoryHandle (name: string, opts: { create?: boolean; } = {}) {
        if (this.deleted) throw new DOMException(...GONE);
        const entry = this._entries[name];
        if (entry) { // entry exist
            if (entry instanceof FileHandle) {
                throw new DOMException(...MISMATCH);
            } else {
                return entry;
            }
        } else {
            if (opts.create) {
                const fh = (this._entries[name] = new FolderHandle(name));
                if (emitter) emitter.emit('created', fh);
                return fh;
            } else {
                throw new DOMException(...GONE);
            }
        }
    }

    async getFileHandle (name: string, opts: { create?: boolean; } = {}) {
        const entry = this._entries[name];
        if (entry) {
            if (entry instanceof FileHandle) {
                return entry;
            } else {
                throw new DOMException(...MISMATCH);
            }
        } else {
            if (!opts.create) {
                throw new DOMException(...GONE);
            } else {
                return (this._entries[name] = new FileHandle(name));
            }
        }
    }

    async removeEntry (name: string, opts: { recursive?: boolean; } = {}) {
        const entry = this._entries[name];
        if (!entry) throw new DOMException(...GONE);
        entry.destroy(opts.recursive);
        delete this._entries[name];
    }

    destroy (recursive?: boolean) {
        for (const x of Object.values(this._entries)) {
            if (!recursive) throw new DOMException(...MOD_ERR);
            x.destroy(recursive);
        }
        if (emitter) emitter.emit('deleted', this);
        this._entries = {};
        this.deleted = true;
    }
}

let fs: FolderHandle;
let emitter: EventEmitter<FileSystemAccessEvents> | undefined;

type Arguments<T> = [T] extends [(...args: infer U) => any]
    ? U
    : [T] extends [void] ? [] : [T];

interface EventEmitter<Events> {
    on<E extends keyof Events>(event: E, listener: Events[E]): () => void,
    once<E extends keyof Events>(event: E, listener: Events[E]): () => void
    off<E extends keyof Events>(event: E, listener: Events[E]): void,
    emit<E extends keyof Events> (event: E, ...args: Arguments<Events[E]>): boolean
}

export interface FileSystemAccessEvents {
    created: (handle: FolderHandle | FileHandle) => void,
    modified: (handle: FileHandle) => void,
    deleted: (handle: FolderHandle | FileHandle) => void
}

export type MemoryAdapterOptions = {
    name: string,
    writeable?: boolean,
    entries?: Record<string, FolderHandle | FileHandle>,
    eventEmitter?: EventEmitter<FileSystemAccessEvents>
};

const adapter: Adapter<MemoryAdapterOptions> = (options) => {
    const { name , writeable = true, eventEmitter, entries } = options;
    fs = new FolderHandle(name, writeable);
    if (entries) fs._entries = entries;
    emitter = eventEmitter;
    return fs;
};

export default adapter;
