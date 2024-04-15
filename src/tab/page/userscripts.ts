import { FileHandle, FolderHandle } from '../../../vendor/file-system-access/adapters/memory';
import FileSystemDirectoryHandle from '../../../vendor/file-system-access/FileSystemDirectoryHandle';
import { ExternalHandler, MessagingFile } from './messaging_file';
import { ListExternalResponseListItem } from './types';

const replaceTag = (tag: string): string => ({
    /* eslint-disable @typescript-eslint/naming-convention */
    '/': '\u2215',
    '\\': '\u244A'
    /* eslint-enable @typescript-eslint/naming-convention */
} as any)[tag] || tag;

const sanitize = (name: string) => name.replace(/[/:\\]/g, replaceTag);

export async function makeDirHandleFromList (root: FolderHandle, list: ListExternalResponseListItem[], handler: ExternalHandler) {
    for (const { path: source_path, name: script_name, namespace, requires, storage } of list) {

        ([ source_path, storage, ...requires ].filter(e => e) as string[]).forEach(full_path => {
            // rip of UUID prefix and use namespace instead
            const [ , type, ...url_parts ] = full_path.split('/');
            const path = [ sanitize(namespace || '<namespace missing>'), sanitize(script_name) ];
            if (type === 'external') path.push(type);

            const dir = path.reduce((dir, path) => {
                if (!dir._entries[path]) dir._entries[path] = new FolderHandle(path, false);
                return dir._entries[path] as FolderHandle;
            }, root);

            const name = type === 'source'
                ? 'script.user.js'
                : type === 'storage'
                    ? 'storage.json'
                    : url_parts && url_parts.length
                        ? sanitize(decodeURIComponent(url_parts.join('/'))) :
                        '<name missing>';

            const file = new MessagingFile(name, full_path, handler);
            dir._entries[name] = new FileHandle(name, file, true);
        });
    }

    return new FileSystemDirectoryHandle(root);
}