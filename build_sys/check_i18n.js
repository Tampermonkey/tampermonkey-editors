#!/usr/bin/env node

/* global require, process */

import { exec } from 'child_process';
import fs from 'fs';

var cache = {};
var used = {};
var doubled = {};
var defined = {};
var args = {};

process.argv.forEach(function (val, _index, _array) {
    var s = val.replace(/^[-]{0,2}/, '').split('=');
    args[s[0]] = s[1] || true;
});

var D = args.debug;
var FOLDERS = 'src/ layout/ vendor/';

(function() {
    if (D) console.log('find used keys');
    return new Promise((resolve) => {
        exec('grep -rnPo "(?<=getMessage\\([\'\\"])[^\'\\"]+" ' + FOLDERS, [], function(_err, stdout, _stderr) {
            stdout
            .split('\n').filter(function(i) {
                return i.trim() !== '';
            })
            .forEach(function(i) {
                var s = i.split(':');
                var f = s.shift();
                var l = s.shift();
                var k = s.join(':');
                // one match is enough
                if (!used[k]) {
                    if (D) console.log('found', k, '@', f + ':' + l);
                    used[k] = { file: f, line: l, occurences: 0 };
                }
            });

            resolve();
        });
    });
})()
.then(function() {
    return new Promise((resolve, reject) => {
        var walk = function(dir, filter, done) {
            var results = [];
            fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file) {
                    file = dir + '/' + file;
                    fs.stat(file, function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, filter, function(err, res) {
                                results = results.concat(res);
                                if (!--pending) done(null, results);
                            });
                        } else {
                            if (!filter || file.match(filter)) results.push(file);
                            if (!--pending) done(null, results);
                        }
                    });
                });
            });
        };
        walk('i18n', /messages\.json$/, function(err, list) {
            if (err) {
                reject(err);
            } else {
                resolve(list);
            }
        });
    });
})
.then(async function(files) {
    for (const file of files) {
        if (D) console.log('process', file);

        await new Promise(resolve => {
            var j = (JSON.parse(fs.readFileSync(file, 'utf8')));
            var all = [];

            for (var k in j) {
                if (!j.hasOwnProperty(k)) continue;
                all.push(k);
            }

            var next = function(_argument) {
                var k = all.pop();

                if (k) {
                    if (cache[k] === undefined) {
                        exec('grep -Pr "getMessage\\([\'\\"]' + k + '[\'\\"]" ' + FOLDERS, [], function(_err, stdout, _stderr) {
                            var out = stdout.split('\n').filter(function(i) {
                                return i.trim() !== '';
                            });

                            cache[k] = out.length !== 0;
                            if (!defined[k]) {
                                defined[k] = { file: file, occurences: 0 };
                            }

                            if (out.length === 0) {
                                if (D) console.log('FAILED -> search for', k);
                            } else if (!used[k]) {
                                console.log('ERROR: should never happen', k);
                            } else {
                                defined[k].occurences++;
                                used[k].occurences++;
                            }

                            next();
                            /* now you've got a list with full path file names */
                        });
                    } else {
                        next();
                    }
                } else {
                    resolve();
                }
            };
            next();
        });
    }

    for (const file of files) {
        if (!args.write) continue;

        if (D) console.log('write', file);

        await new Promise((resolve, reject) => {
            var j = (JSON.parse(fs.readFileSync(file, 'utf8')));
            var ks = Object.keys(j);
            var k, n = {};

            if (args.sort) ks = ks.sort();

            for (var i=0; (k=ks[i]); i++) {
                if (!j.hasOwnProperty(k)) continue;

                if (used[k] && used[k].occurences) {
                    n[k] = j[k];
                }
            }

            if (args.missing) {
                for (k in used) {
                    if (!used.hasOwnProperty(k)) continue;

                    if (!used[k].occurences) {
                        n[k] = {
                            'message': '!!! TODO !!!'
                        };
                    }
                }
            }

            if (args.purge) {
                args.purge.split(',').forEach(function(k) {
                    delete n[k];
                });
            }

            fs.writeFile(file + '.new', JSON.stringify(n, null, 4) + '\n', function(err) {
                if(err) {
                    console.log(err);
                    reject();
                } else {
                    resolve();
                }
            });
        });

    }

    for (const file of files) {
        if (!args.write) continue;

        if (D) console.log('check ' + file + ' for doubled keys');

        await new Promise(resolve => {

            exec('cat ' + file + ' | grep -oP "^ {2,4}\\"[^\\"]+\\"" | sort | grep -vP \'"message"|"placeholders"\' | uniq -c | sort | grep -vP "^ +1 "', [], function(_err, stdout, _stderr) {
                if (stdout.split('\n').length > 1) {
                    doubled[file] = stdout;
                }
                resolve();
            });
        });
    }
})
.then(function() {
    var k, r = 0;

    for (k in used) {
        if (!used.hasOwnProperty(k)) continue;
        if (!used[k].occurences) {
            console.log('UNDEFINED:', k, 'defined @ ' + used[k].file + ':' + used[k].line);
            r = 1;
        }
    }

    for (k in defined) {
        if (!defined.hasOwnProperty(k)) continue;
        if (!defined[k].occurences) {
            console.log('UNUSED:', k, 'defined @ ' + defined[k].file);
            r = 2;
        }
    }
    for (k in doubled) {
        if (!doubled.hasOwnProperty(k)) continue;
        console.log('DOUBLED:', k, '\n' + doubled[k]);
        r = 3;
    }

    if (r) process.exit(r);
})
.then(function() {
    if (args.write) {
        console.log('Overwrite bash command:');
        console.log('cd i18n; find -iname *.new | rename -f -v "s/.new//g";');
    }

    process.exit(0);
}, function() {
    process.exit(3);
});
