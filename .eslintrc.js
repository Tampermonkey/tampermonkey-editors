/* globals module */

const default_rules = {
    'no-restricted-syntax': [
        'warn',
        'ForInStatement'
    ],
    'tampermonkey/no-global-object-access': [ 'warn', { aggressive: true } ],
    'indent': [
        'warn', 4,
        {
            'ignoreComments': true,
            'SwitchCase': 1,
            'MemberExpression': 0,
            'offsetTernaryExpressions': false
        }
    ]
};

const extension_page_rules = {
    'tampermonkey/no-global-object-access': 'off'
};

const content_script_rules = {
    'tampermonkey/no-global-object-access': 'off'
};

const unsafe_env_ts = [
    'src/tab/**/*.ts'
];

const uniq = (a, b) => {
    b.forEach(function(item) {
        if (a.indexOf(item) < 0) {
            a.push(item);
        }
    });
    return a;
};

const merge_rules = (dest, ...srcs) => {
    for (const src of srcs) {
        for (const [ k, v ] of Object.entries(src)) {
            const t = typeof dest[k];
            if (t === 'undefined') {
                dest[k] = v;
            } else if (t === 'object' || t === 'string') {
                if ([ 'off', 0 ].includes(v)) {
                    dest[k] = v;
                } else if (Array.isArray(dest[k])) {
                    if (Array.isArray(v)) {
                        const [ level, ...rules ] = dest[k];
                        dest[k] = [ level, ...uniq(rules, v.slice(1)) ];
                    }
                } else {
                    dest[k] = v;
                }
            } else {
                console.log(`eslintrc.js: unknown rule type ${t} ${k}`);
            }
        }
    }

    return dest;
};

const ts_rules = merge_rules({
    'linebreak-style': [ 'warn', 'unix' ],
    'no-constant-condition': [ 'warn', { 'checkLoops': false } ],
    'no-empty': [ 'warn', { 'allowEmptyCatch': true } ],
    'no-debugger': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/strict-boolean-expressions': [ 'warn', { 'allowConstantLoopConditions': true } ],
    '@typescript-eslint/no-unused-vars': [ 'warn', { 'argsIgnorePattern': '^_' } ],
    '@typescript-eslint/semi': [ 'warn', 'always', { 'omitLastInOneLineBlock': true } ],
    '@typescript-eslint/quotes': [ 'warn', 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true } ],
    '@typescript-eslint/no-empty-interface': [ 'warn', { 'allowSingleExtends': true } ],
    '@typescript-eslint/naming-convention': [ 'warn', {
        'selector': 'property',
        'format': ['strictCamelCase', 'PascalCase']
    }]
}, default_rules);

const extends_ts = [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking'
];

module.exports = {
    plugins: [ 'es' , 'tampermonkey' ],
    env: {
        browser: true,
        es6: true
    },
    extends: [
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        // project: './tsconfig.json',
        ecmaVersion: 11,
        sourceType: 'module',
        ecmaFeatures: {
        }
    },
    ignorePatterns: [ 'webpack.config.js' ], // , 'eslint/**/*.js' ],
    rules: {
    },
    overrides: [
        {
            files: [ '**/*.ts' ],
            extends: extends_ts,
            parserOptions: {
                project: [ './tsconfig.json' ]
            },
            rules: ts_rules
        },
        {
            files: [ 'src/popup/*.ts' ],
            extends: extends_ts,
            rules: merge_rules({}, ts_rules, extension_page_rules)
        },
        {
            files: unsafe_env_ts,
            extends: extends_ts,
            rules: merge_rules({}, ts_rules, content_script_rules)
        }
    ]
};