#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require("../app.json");
const lib = require("../lib");
async function diff() {
    let config = {
        tasks: []
    };
    let source;
    let target;
    let overwrite;
    function clearTask() {
        source = undefined;
        target = undefined;
        overwrite = undefined;
    }
    function checkTask() {
        if (source != null && target != null) {
            config.tasks.push({
                source,
                target,
                overwrite
            });
            clearTask();
        }
    }
    let unrecognized_arguments = [];
    let positional_index = 0;
    for (let [index, arg] of process.argv.slice(3).entries()) {
        let parts = null;
        if ((parts = /^--source=(.+)$/.exec(arg)) != null) {
            source = parts[1];
            checkTask();
            continue;
        }
        if ((parts = /^--target=(.+)$/.exec(arg)) != null) {
            target = parts[1];
            checkTask();
            continue;
        }
        if ((parts = /^--overwrite=(.+)$/.exec(arg)) != null) {
            overwrite = parts[1] === "true";
            checkTask();
            continue;
        }
        if ((parts = /^--config=(.+)$/.exec(arg)) != null) {
            let path = parts[1];
            config = lib.loadConfig(path);
            clearTask();
            continue;
        }
        if (positional_index % 2 === 0) {
            source = arg;
            checkTask();
            positional_index += 1;
            continue;
        }
        if (positional_index % 2 === 1) {
            target = arg;
            checkTask();
            positional_index += 1;
            continue;
        }
        unrecognized_arguments.push(arg);
    }
    if (unrecognized_arguments.length > 0 || config.tasks.length === 0) {
        process.stderr.write(`${app.name} v${app.version}\n`);
        process.stderr.write(`\n`);
        for (let unrecognized_argument of unrecognized_arguments) {
            process.stderr.write(`Unrecognized argument "${unrecognized_argument}"!\n`);
        }
        process.stderr.write(`\n`);
        process.stderr.write(`Arguments:\n`);
        process.stderr.write(`	--source=string\n`);
        process.stderr.write(`		Set source path.\n`);
        process.stderr.write(`	--target=string\n`);
        process.stderr.write(`		Set target path.\n`);
        process.stderr.write(`	--overwrite=boolean\n`);
        process.stderr.write(`		Configure overwriting of files with identical metadata (defaults to false).\n`);
        process.stderr.write(`	--config=string\n`);
        process.stderr.write(`		Load config from path.\n`);
        process.exit(0);
    }
    else {
        await lib.diff(config);
        process.exit(0);
    }
}
;
async function sync() {
    let config = {
        tasks: []
    };
    let source;
    let target;
    let overwrite;
    function clearTask() {
        source = undefined;
        target = undefined;
        overwrite = undefined;
    }
    function checkTask() {
        if (source != null && target != null) {
            config.tasks.push({
                source,
                target,
                overwrite
            });
            clearTask();
        }
    }
    let unrecognized_arguments = [];
    let positional_index = 0;
    for (let [index, arg] of process.argv.slice(3).entries()) {
        let parts = null;
        if ((parts = /^--source=(.+)$/.exec(arg)) != null) {
            source = parts[1];
            checkTask();
            continue;
        }
        if ((parts = /^--target=(.+)$/.exec(arg)) != null) {
            target = parts[1];
            checkTask();
            continue;
        }
        if ((parts = /^--overwrite=(.+)$/.exec(arg)) != null) {
            overwrite = parts[1] === "true";
            checkTask();
            continue;
        }
        if ((parts = /^--config=(.+)$/.exec(arg)) != null) {
            let path = parts[1];
            config = lib.loadConfig(path);
            clearTask();
            continue;
        }
        if (positional_index % 2 === 0) {
            source = arg;
            checkTask();
            positional_index += 1;
            continue;
        }
        if (positional_index % 2 === 1) {
            target = arg;
            checkTask();
            positional_index += 1;
            continue;
        }
        unrecognized_arguments.push(arg);
    }
    if (unrecognized_arguments.length > 0 || config.tasks.length === 0) {
        process.stderr.write(`${app.name} v${app.version}\n`);
        process.stderr.write(`\n`);
        for (let unrecognized_argument of unrecognized_arguments) {
            process.stderr.write(`Unrecognized argument "${unrecognized_argument}"!\n`);
        }
        process.stderr.write(`\n`);
        process.stderr.write(`Arguments:\n`);
        process.stderr.write(`	--source=string\n`);
        process.stderr.write(`		Set source path.\n`);
        process.stderr.write(`	--target=string\n`);
        process.stderr.write(`		Set target path.\n`);
        process.stderr.write(`	--overwrite=boolean\n`);
        process.stderr.write(`		Configure overwriting of files with identical metadata (defaults to false).\n`);
        process.stderr.write(`	--config=string\n`);
        process.stderr.write(`		Load config from path.\n`);
        process.exit(0);
    }
    else {
        await lib.sync(config);
        process.exit(0);
    }
}
;
async function run() {
    let command = process.argv[2] ?? "";
    if (command === "diff") {
        return diff();
    }
    if (command === "sync") {
        return sync();
    }
    process.stderr.write(`${app.name} v${app.version}\n`);
    process.stderr.write(`\n`);
    process.stderr.write(`Unrecognized command "${command}"!\n`);
    process.stderr.write(`\n`);
    process.stderr.write(`Commands:\n`);
    process.stderr.write(`	diff\n`);
    process.stderr.write(`		Determine synchronization operations required.\n`);
    process.stderr.write(`	sync\n`);
    process.stderr.write(`		Perform synchronization operations.\n`);
    process.exit(0);
}
;
run();
