#!/usr/bin/env node

/* global process, __dirname */

import { spawnSync } from 'child_process';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import which from 'which';
import archiver from 'archiver';
import glob from 'glob';
import tmp from 'tmp';
import getConfigs from './webpack.config';

tmp.setGracefulCleanup();

const get_args_value = (args, arg) => {
    const a = arg[arg.length - 1];
    let i = -1;
    args.some((arg, idx) => {
        if (arg[0] == '-' && arg.indexOf(a) != -1) {
            i = idx;
            return true;
        }
    });
    if (i === -1) return;
    const [ , r ] = args.splice(i, 2);
    return r;
};

// sets the value of an argument, make sure double args like -it are parsed through parse_args first!
const set_args_value = (args, arg, value) => {
    const a = arg[arg.length - 1];
    let i = -1;
    args.some((arg, idx) => {
        if (arg[0] == '-' && arg.indexOf(a) != -1) {
            i = idx;
            return true;
        }
    });
    if (i === -1) return;
    args.splice(i, 2, arg, value);
}

const args = process.argv.slice(2);
const method = args[0];
const forward_args = args.slice(1);

const verbose = [ '1', 'true' ].includes(process.env['verbose']) || get_args_value(args, '-d') || false;

let t = process.env.TARGET = process.env.TARGET || get_args_value(args, '-t') || 'chrome';
const v = process.env.VERSION = process.env.VERSION || get_args_value(args, '-v') || 0;

let [ target, manifest ] = t.split('+');

if (!manifest) {
    if (target == 'firefox') {
        manifest = 'mv3ep';
    } else {
        manifest = 'mv3';
    }
    t = process.env.TARGET = target + '+' + manifest;
    set_args_value(forward_args, '-t', t);
}

console.log(`Running for target: ${target}, manifest: ${manifest}`);

const findAvailableBrowser = async () => {
    const browsers = ["chromium", "google-chrome-beta", "google-chrome-unstable"];

    for (let browser of browsers) {
        let path = await which(browser);
        if (path) {
            return path.toString();
        }
    }

    throw new Error("No browser found!");
};

const zipFolder = (folder, fileName) => {
    return new Promise((resolve) => {
        let output = fs.createWriteStream(fileName);
        let archive = archiver('zip');

        output.on('close', function() {
            resolve();
        });

        archive.on('error', function(err) {
            resolve("Failed to create archive: " + err.message);
        });

        archive.pipe(output);

        glob(folder + '/**/*', function(err, files) {
            if (err) {
                resolve("Failed to find files: " + err.message);
                return;
            }

            files.forEach(function(file) {
                let relativePath = path.relative(folder, file);
                archive.file(file, { name: relativePath });
            });

            archive.finalize();
        });
    });
};

const methods = {
    lint: async () => {
        return spawnSync(
            'npx',
            [
                'eslint',
                'src/',
                '--max-warnings', '10'
            ],
            { stdio: 'inherit' }
        ).status;
    },
    check: async () => {
        return spawnSync(
            'node',
            [
                '-r', 'esm',
                './build_sys/check_i18n.js' /* , '--debug' */,
                ...forward_args
            ],
            { stdio: 'inherit' }
        ).status;
    },
    manifest: async () => {
        const __short_version__ = '1.0';
        const __bundle_version__ = v;
        const file = target === 'chrome'
            ? './build_sys/chrome_mv3.manifest.json'
            : './build_sys/firefox_mv3.manifest.json';

        let src = fs.readFileSync(file).toString();
        src = src.replace(/__short_version__/g, __short_version__);
        src = src.replace(/__bundle_version__/g, __bundle_version__);
        fs.writeFileSync('out/rel/manifest.json', src);
    },
    pack: async () => {
        const { content, page, background } = getConfigs();

        await Promise.all([
            content,
            page,
            background
        ].map(async (config) => {
            return await new Promise((resolve) => webpack(config, async (err, stats) => {
                if (err || stats && stats.hasErrors()) {
                    console.log('pack failed!');
                    console.warn(err || stats.toString());
                    exit(1);
                } else {
                    console.log(stats.toString(verbose ? 'verbose' : undefined));
                    resolve();
                }
            }));
        }));
    },
    build: async () => {
        const a = forward_args;
        const p = path.resolve(__dirname, 'rnd.txt');
        if (fs.existsSync(p)) {
            process.env.rnd = fs.readFileSync(p).toString();
        } else {
            process.env.rnd = process.env.rnd || Math.random().toString(36).substr(2, 10);
        }

        [
            { m: 'pack', a: false, r: true },
            { m: 'manifest', a, r: true },
        ].some(e => {
            if (!e.r) return;

            console.log(`Running command ${e.m} now`);

            const status = spawnSync(
                'npm',
                [
                    'run', e.m
                ].concat(e.a && e.a.length ? [ '--', ...e.a ] : []),
                { stdio: 'inherit' }
            ).status;

            if (status !== 0) {
                console.log(`Command ${e.m} failed!`);
                exit(status);
            }
        });
    },
    package: async () => {
        if (target == 'chrome') {
            let chromeBrowser;

            if (!process.env.CHROME_BIN) {
                try {
                    chromeBrowser = await findAvailableBrowser();
                } catch (error) {
                    console.log("No suitable browser found.");
                    process.exit(1);
                }
            } else {
                chromeBrowser = path.resolve(process.env.CHROME_BIN);
            }
            console.log("Using Chrome-based browser: " + chromeBrowser);

            const { status, error } = spawnSync(
                chromeBrowser,
                [
                    '--pack-extension=out/rel/',
                    '--pack-extension-key=build_sys/tme_test.pem',
                    '--disable-background-networking'
                ],
                { stdio: 'inherit' }
            );

            if (status !== 0) {
                console.log('Command package failed!', status, error);
                exit(status);
            }
            const error2 = await zipFolder('out/rel', 'out/rel.zip');
            if (error2) {
                console.log(error2);
                console.log('Command package failed!');
                exit(1);
            }
        } else if (target == 'firefox') {
            const error = await zipFolder('out/rel', 'out/rel.xpi');
            if (error) {
                console.log(error);
                console.log('Command package failed!');
                exit(1);
            }
        } else {
            console.warn('Unknown target!');
            console.log('Command package failed!');
            exit(1);
        }

        const error = await zipFolder('out/sourcemaps', 'out/sourcemaps.zip');
        if (error) {
            console.log(error);
            console.log('Command package failed!');
            exit(1);
        }
    },
    all: async () => {
        const a = forward_args;
        const h = get_args_value(a, '-h');
        const c = get_args_value(a, '-c');

        [
            { m: 'clean', a: false, r: true },
            { m: 'lint', a: false, r: h !== 'off' },
            { m: 'check', a: false, r: c !== 'off' },
            { m: 'build', a: a, r: true },
            { m: 'package', a: a, r: true }
        ].some(e => {
            if (!e.r) return;

            console.log(`Running command ${e.m} now`);

            const status = spawnSync(
                'npm',
                [
                    'run', e.m
                ].concat(e.a && e.a.length ? [ '--', ...e.a ] : []),
                { stdio: 'inherit' }
            ).status;

            if (status !== 0) {
                console.log(`Command ${e.m} failed!`);
                exit(status);
            }
        });
    }
};

const f = methods[method];

if (!f) {
    exit(1);
} else {
    f().then(exit).catch(err => console.log(err));
}
