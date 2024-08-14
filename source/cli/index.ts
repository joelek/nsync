#!/usr/bin/env node

import * as app from "../app.json";
import * as lib from "../lib";

async function diff(): Promise<void> {
	let config: lib.Config = {
		tasks: []
	};
	let source: string | undefined;
	let target: string | undefined;
	function checkTask(): void {
		if (source != null && target != null) {
			config.tasks.push({
				source,
				target
			});
			source = undefined;
			target = undefined;
		}
	}
	let unrecognized_arguments = [] as Array<string>;
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
		if ((parts = /^--config=(.+)$/.exec(arg)) != null) {
			let path = parts[1];
			config = lib.loadConfig(path);
			continue;
		}
		if (index === 0) {
			source = arg;
			checkTask();
			continue;
		}
		if (index === 1) {
			target = arg;
			checkTask();
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
	function checkTask(): void {
		if (source != null && target != null) {
			config.tasks.push({
				source,
				target
			});
			source = undefined;
			target = undefined;
		}
	}
	let unrecognized_arguments = [] as Array<string>;
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
		if ((parts = /^--config=(.+)$/.exec(arg)) != null) {
			let path = parts[1];
			config = lib.loadConfig(path);
			continue;
		}
		if (index === 0) {
			source = arg;
			checkTask();
			continue;
		}
		if (index === 1) {
			target = arg;
			checkTask();
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
