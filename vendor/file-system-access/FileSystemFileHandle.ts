import { FileSystemHandle } from './FileSystemHandle';
import { FileSystemFileHandleAdapter } from './interfaces';
import { FileSystemWritableFileStream } from './FileSystemWritableFileStream';

const kAdapter = Symbol('adapter');

export class FileSystemFileHandle extends FileSystemHandle implements globalThis.FileSystemFileHandle {
    /** @internal */
    [kAdapter]: FileSystemFileHandleAdapter;
    override readonly kind = 'file';

    constructor (adapter: FileSystemFileHandleAdapter) {
        super(adapter);
        this[kAdapter] = adapter;
    }

    async createWritable (options: FileSystemCreateWritableOptions = {}) {
        return new FileSystemWritableFileStream(
            await this[kAdapter].createWritable(options)
        );
    }

    async getFile () {
        return this[kAdapter].getFile();
    }
}

Object.defineProperty(FileSystemFileHandle.prototype, Symbol.toStringTag, {
    value: 'FileSystemFileHandle',
    writable: false,
    enumerable: false,
    configurable: true
});

Object.defineProperties(FileSystemFileHandle.prototype, {
    createWritable: { enumerable: true },
    getFile: { enumerable: true }
});

export default FileSystemFileHandle;
