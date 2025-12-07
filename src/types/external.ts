export type Request = {
    origin?: string
};
// #region userscripts external API
export type UserscriptsRequest = Request & {
    method: 'userscripts',
    messageId: string
};

export type ExternalRequestError = { number: number, message: string };

export type OptionsExternalRequest = UserscriptsRequest & {
    action: 'options',
    activeUrls: string[]
};
export type OptionsExternalResponse = {
    messageId: string,
    allow: string[]
};

export type ListExternalRequestFilterContent = {
    pattern: string,
    isRegExp?: boolean,
    isCaseSensitive?: boolean,
    isWordMatch?: boolean,
    wordSeparators?: string
};

export type ListExternalRequestFilterLocation = {
    includePattern: string[]
};

export type ListExternalRequestFilter = {
    content: ListExternalRequestFilterContent,
    location: ListExternalRequestFilterLocation
};

export type ListExternalRequest = UserscriptsRequest & {
    action: 'list',
    filter?: ListExternalRequestFilter
};
export type ListExternalResponseListItem = {
    namespace: string,
    name: string,
    path: string,
    requires: string[]
    storage: string | undefined
};
export type ListExternalResponse = {
    messageId: string,
    list: ListExternalResponseListItem[] | Partial<ListExternalResponseListItem>[]
};
export type GetExternalRequest = UserscriptsRequest & {
    action: 'get',
    ifNotModifiedSince?: number,
    path: string
};
export type GetExternalResponse = {
    messageId: string,
    lastModified: number | undefined,
    value: string | undefined,
    error?: ExternalRequestError
};
type UpdateExternalRequest = UserscriptsRequest & {
    path: string,
    value: string
    lastModified?: number
};
export type SetExternalRequest = UpdateExternalRequest & {
    action: 'patch'
};
export type CreateExternalRequest = UpdateExternalRequest & {
    action: 'put'
};
export type UpdateExternalResponse = {
    messageId: string,
    error?: ExternalRequestError
};
export type DeleteExternalRequest = UserscriptsRequest & {
    action: 'delete',
    path: string
};
export type DeleteExternalResponse = {
    messageId: string,
    error?: ExternalRequestError
};

export type ExternalRequest =
    OptionsExternalRequest |
    ListExternalRequest |
    GetExternalRequest |
    SetExternalRequest |
    CreateExternalRequest |
    DeleteExternalRequest;

// #endregion