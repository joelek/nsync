#!/usr/bin/env node

import * as app from "../app.json";
import * as lib from "../lib";

async function diff(): Promise<void> {
	let config: lib.Config = {
		tasks: []
	};
	let source: string | undefined;
	let target: string | undefined;
	let overwrite: boolean | undefined;
	function clearTask(): void {
		source = undefined;
		target = undefined;
		overwrite = undefined;
	}
	function checkTask(): void {
		if (source != null && target != null) {
			config.tasks.push({
				source,
				target,
				overwrite
			});
			clearTask();
		}
	}
	let unrecognized_arguments = [] as Array<string>;
	let positional_index = 0;
	for (let [index, arg] of process.argv.slice(3).entries()) {
		let parts: RegExpExecArray | null = null;
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
	} else {
		await lib.diff(config);
		process.exit(0);
	}
};

async function sync(): Promise<void> {
	let config: lib.Config = {
		tasks: []
	};
	let source: string | undefined;
	let target: string | undefined;
	let overwrite: boolean | undefined;
	function clearTask(): void {
		source = undefined;
		target = undefined;
		overwrite = undefined;
	}
	function checkTask(): void {
		if (source != null && target != null) {
			config.tasks.push({
				source,
				target,
				overwrite
			});
			clearTask();
		}
	}
	let unrecognized_arguments = [] as Array<string>;
	let positional_index = 0;
	for (let [index, arg] of process.argv.slice(3).entries()) {
		let parts: RegExpExecArray | null = null;
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
			clearTask()
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
	} else {
		await lib.sync(config);
		process.exit(0);
	}
};

async function run(): Promise<void> {
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
};

run();
