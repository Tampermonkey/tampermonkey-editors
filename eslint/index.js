/* globals require, module  */

// const projectName = 'eslint-plugin-tampermonkey';

const fs = require('fs');
const path = require('path');

const ruleFiles = fs
.readdirSync('./eslint')
.filter(file => file !== 'index.js' && file.endsWith('.js') && !file.endsWith('test.js'));

const rules = Object.fromEntries(
    ruleFiles.map(file => {
        const r = require('./' + file);
        return [ path.basename(file, '.js'), r ];
    }),
);

module.exports.rules = rules;