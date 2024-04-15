/* globals require, module  */

/* Used to lint extension code and prepare usage at service workers */

const { READ, ReferenceTracker } = require('eslint-utils');

const oFns = {
    // "JSON": { [READ]: true },
    // "Math": { [READ]: true },
    // "Date": { [READ]: true },
    "FileReader": { [READ]: true },
    "TextDecoder": { [READ]: true },
    "DOMParser": { [READ]: true },
    "Notification": { [READ]: true },
    "XMLHttpRequest": { [READ]: true },
    "Image": { [READ]: true },
    "fetch": { [READ]: true },
    "AbortController": { [READ]: true },
    "window": { [READ]: true },
    "document": { [READ]: true },
    "setTimeout": { [READ]: true },
    "clearTimeout": { [READ]: true },
    "setInterval": { [READ]: true },
    "clearInterval": { [READ]: true },
    "localStorage": { [READ]: true },
    "openDatabase": { [READ]: true },
    "confirm": { [READ]: true },
    "alert": { [READ]: true },
    "atob": { [READ]: true },
    "btoa": { [READ]: true },
    "escape": { [READ]: true },
    "unescape": { [READ]: true },
    "webkitNotifications": { [READ]: true },
    "crypto": { [READ]: true },
    "encodeURIComponent": { [READ]: true },
    "decodeURIComponent": { [READ]: true },
    "location": { [READ]: true },
    "screen": { [READ]: true },
};

module.exports = {
    meta: {
        docs: {
            description: 'No unsafe global object access',
        },
        schema: [
            {
                type: "object",
                properties: {
                    aggressive: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            forbidden: "Unsafe global object access '{{ name }}' is forbidden",
        }
    },
    create(context) {
        return {
            'Program:exit'() {
                const tracker = new ReferenceTracker(context.getScope());
                for (const { node, path } of tracker.iterateGlobalReferences(oFns)) {
                    if (node && node.parent && node.parent.type == 'TSTypeReference') continue;
                    context.report({
                        node,
                        messageId: 'forbidden',
                        data: { name: path.join('.') },
                    });
                }
            }
        };
    }
};
