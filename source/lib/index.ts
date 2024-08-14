import * as guards from "@joelek/ts-autoguard/dist/lib-shared/guards";
import * as libfs from "fs";
import * as libpath from "path";
import * as libstream from "stream";
import * as terminal from "./terminal";

export class ExpectedPathError extends Error {
	protected path: string;

	constructor(path: string) {
		super();
		this.path = path;
	}

	get message(): string {
		return `Expected path "${this.path}" to exist!`;
	}
};

export class InvalidPathRelationError extends Error {
	protected source: string;
	protected target: string;

	constructor(source: string, target: string) {
		super();
		this.source = source;
		this.target = target;
	}

	get message(): string {
		return `Expected paths "${this.source}" and "${this.target}" to have a disjoint path relationship!`;
	}
};

enum PathRelationship {
	IDENTICAL,
	DISJOINT,
	CONTAINED
};

function determinePathRelationship(source: string, target: string): PathRelationship {
	let target_path_relative_to_source = libpath.relative(source, target);
	if (target_path_relative_to_source === "") {
		return PathRelationship.IDENTICAL;
	}
	if (target_path_relative_to_source.startsWith("..")) {
		return PathRelationship.DISJOINT;
	}
	if (libpath.isAbsolute(target_path_relative_to_source)) {
		return PathRelationship.DISJOINT;
	}
	return PathRelationship.CONTAINED;
};

export class InvalidEntryType extends Error {
	protected path: string;

	constructor(path: string) {
		super();
		this.path = path;
	}

	get message(): string {
		return `Expected paths "${this.path}" to be a directory or a file!`;
	}
};

enum EntryType {
	DIRECTORY,
	FILE
};

type DirectoryStat = {
	type: EntryType.DIRECTORY;
};

type FileStat = {
	type: EntryType.FILE;
	timestamp: number;
	size: number;
};

abstract class AbstractFileSystem {
	constructor() {}

	abstract createDirectory(path: string): Promise<void>;
	abstract createFile(path: string, readable: libstream.Readable, timestamp: number): Promise<void>;
	abstract createReadable(path: string): Promise<libstream.Readable>;
	abstract formatPath(path: string): string;
	abstract getStat(path: string): Promise<DirectoryStat | FileStat | undefined>;
	abstract joinPath(path: string, entry: string): string;
	abstract listDirectoryEntries(path: string): Promise<Array<string>>;
	abstract removeDirectory(path: string): Promise<void>;
	abstract removeDirectoryEntries(path: string): Promise<void>;
	abstract removeFile(path: string): Promise<void>;
};

type FileSystemStatistics = {
	files_created: number;
	files_removed: number;
	directories_created: number;
	directories_removed: number;
};

class LocalFileSystem extends AbstractFileSystem {
	protected sync: boolean;
	protected statistics: FileSystemStatistics;

	protected getPathComponents(path: string): Array<string> {
		let resolved = libpath.resolve(path);
		let parsed = libpath.parse(resolved);
		let directories = parsed.dir.split(libpath.sep);
		let entry = parsed.base;
		return [...directories, entry];
	}

	constructor(sync: boolean) {
		super();
		this.sync = sync;
		this.statistics = {
			files_created: 0,
			files_removed: 0,
			directories_created: 0,
			directories_removed: 0
		};
	}

	async createDirectory(path: string): Promise<void> {
		process.stdout.write(`${terminal.stylize("create", terminal.FG_GREEN)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(directory)", terminal.FG_CYAN)}\n`);
		if (this.sync) {
			libfs.mkdirSync(path);
			this.statistics.directories_created += 1;
		}
	}

	async createFile(path: string, readable: libstream.Readable, timestamp: number): Promise<void> {
		process.stdout.write(`${terminal.stylize("create", terminal.FG_GREEN)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(file)", terminal.FG_CYAN)}\n`);
		if (this.sync) {
			libfs.writeFileSync(path, Uint8Array.of());
			try {
				await new Promise<void>((resolve, reject) => {
					let writable = libfs.createWriteStream(path);
					writable.on("close", () => {
						this.statistics.files_created += 1;
						resolve();
					});
					writable.on("error", (error) => {
						reject(error);
					});
					readable.pipe(writable);
				});
				libfs.utimesSync(path, timestamp * 0.001, timestamp * 0.001);
			} catch (error) {
				libfs.rmSync(path);
				throw error;
			}
		}
	}

	async createReadable(path: string): Promise<libstream.Readable> {
		let readable = libfs.createReadStream(path);
		return readable;
	}

	formatPath(path: string): string {
		return this.getPathComponents(path).join(libpath.sep);
	}

	async getStat(path: string): Promise<DirectoryStat | FileStat | undefined> {
		if (libfs.existsSync(path)) {
			let stat = libfs.statSync(path);
			if (stat.isDirectory()) {
				return {
					type: EntryType.DIRECTORY
				};
			}
			if (stat.isFile()) {
				return {
					type: EntryType.FILE,
					timestamp: Math.floor(stat.mtimeMs),
					size: stat.size
				};
			}
			throw new InvalidEntryType(path);
		}
	}

	joinPath(path: string, entry: string): string {
		return libpath.join(path, entry);
	}

	async listDirectoryEntries(path: string): Promise<Array<string>> {
		return libfs.readdirSync(path).sort();
	}

	async removeDirectory(path: string): Promise<void> {
		process.stdout.write(`${terminal.stylize("remove", terminal.FG_RED)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(directory)", terminal.FG_CYAN)}\n`);
		if (this.sync) {
			libfs.rmdirSync(path);
			this.statistics.directories_removed += 1;
		}
	}

	async removeDirectoryEntries(path: string): Promise<void> {
		let entries = await this.listDirectoryEntries(path);
		for (let entry of entries.reverse()) {
			let new_path = this.joinPath(path, entry);
			let new_path_stat = await this.getStat(new_path);
			if (new_path_stat != null) {
				if (new_path_stat.type === EntryType.DIRECTORY) {
					await this.removeDirectoryEntries(new_path);
					await this.removeDirectory(new_path)
				} else {
					await this.removeFile(new_path);
				}
			}
		}
	}

	async removeFile(path: string): Promise<void> {
		process.stdout.write(`${terminal.stylize("remove", terminal.FG_RED)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(file)", terminal.FG_CYAN)}\n`);
		if (this.sync) {
			libfs.rmSync(path);
			this.statistics.files_removed += 1;
		}
	}
};

async function processRecursively(source_fs: AbstractFileSystem, target_fs: AbstractFileSystem, source: string, target: string): Promise<void> {
	let source_stat = await target_fs.getStat(source);
	let target_stat = await target_fs.getStat(target);
	if (source_stat != null) {
		if (source_stat.type === EntryType.DIRECTORY) {
			if (target_stat != null) {
				if (target_stat.type === EntryType.DIRECTORY) {
					let source_entries = new Set(await source_fs.listDirectoryEntries(source));
					let target_entries = new Set(await target_fs.listDirectoryEntries(target));
					for (let source_entry of source_entries) {
						await processRecursively(source_fs, target_fs, source_fs.joinPath(source, source_entry), target_fs.joinPath(target, source_entry));
					}
					for (let target_entry of target_entries) {
						if (!source_entries.has(target_entry)) {
							await processRecursively(source_fs, target_fs, source_fs.joinPath(source, target_entry), target_fs.joinPath(target, target_entry));
						}
					}
				} else {
					await target_fs.removeFile(target);
					for (let source_entry of await source_fs.listDirectoryEntries(source)) {
						await processRecursively(source_fs, target_fs, source_fs.joinPath(source, source_entry), target_fs.joinPath(target, source_entry));
					}
				}
			} else {
				await target_fs.createDirectory(target);
				for (let source_entry of await source_fs.listDirectoryEntries(source)) {
					await processRecursively(source_fs, target_fs, source_fs.joinPath(source, source_entry), target_fs.joinPath(target, source_entry));
				}
			}
		} else {
			if (target_stat != null) {
				if (target_stat.type === EntryType.DIRECTORY) {
					await target_fs.removeDirectoryEntries(target);
					await target_fs.removeDirectory(target);
					await target_fs.createFile(target, await source_fs.createReadable(source), source_stat.timestamp);
				} else {
					let timestamp_difference = source_stat.timestamp !== target_stat.timestamp;
					let size_difference = source_stat.size !== target_stat.size;
					if (timestamp_difference || size_difference) {
						await target_fs.removeFile(target);
						await target_fs.createFile(target, await source_fs.createReadable(source), source_stat.timestamp);
					}
				}
			} else {
				await target_fs.createFile(target, await source_fs.createReadable(source), source_stat.timestamp);
			}
		}
	} else {
		if (target_stat != null) {
			if (target_stat.type === EntryType.DIRECTORY) {
				await target_fs.removeDirectoryEntries(target);
				await target_fs.removeDirectory(target);
			} else {
				await target_fs.removeFile(target);
			}
		}
	}
};

export const Config = guards.Object.of({
	tasks: guards.Array.of(
		guards.Object.of({
			source: guards.String,
			target: guards.String
		})
	)
});

export type Config = ReturnType<typeof Config["as"]>;

export function loadConfig(path: string): Config {
	let string = libfs.readFileSync(path, "utf-8");
	let json = JSON.parse(string);
	return Config.as(json);
};

export async function diff(config: Config): Promise<void> {
	for (let { source, target } of config.tasks) {
		try {
			let source_fs = new LocalFileSystem(false);
			let target_fs = new LocalFileSystem(false);
			process.stdout.write(`Performing diff from ${terminal.stylize("\"" + source_fs.formatPath(source) + "\"", terminal.FG_YELLOW)} into ${terminal.stylize("\"" + target_fs.formatPath(target) + "\"", terminal.FG_YELLOW)}\n`);
			if (await source_fs.getStat(source) == null) {
				throw new ExpectedPathError(source_fs.formatPath(source));
			}
			if (determinePathRelationship(source, target) !== PathRelationship.DISJOINT) {
				throw new InvalidPathRelationError(source, target);
			}
			if (determinePathRelationship(target, source) !== PathRelationship.DISJOINT) {
				throw new InvalidPathRelationError(target, source);
			}
			await processRecursively(source_fs, target_fs, source, target);
		} catch (error) {
			process.stderr.write(`An error occurred!\n`);
			if (error instanceof Error) {
				process.stderr.write(`${error.stack ?? ""}`);
			}
		}
	}
};

export async function sync(config: Config): Promise<void> {
	for (let { source, target } of config.tasks) {
		try {
			let source_fs = new LocalFileSystem(false);
			let target_fs = new LocalFileSystem(true);
			process.stdout.write(`Performing sync from ${terminal.stylize("\"" + source_fs.formatPath(source) + "\"", terminal.FG_YELLOW)} into ${terminal.stylize("\"" + target_fs.formatPath(target) + "\"", terminal.FG_YELLOW)}\n`);
			if (await source_fs.getStat(source) == null) {
				throw new ExpectedPathError(source_fs.formatPath(source));
			}
			if (determinePathRelationship(source, target) !== PathRelationship.DISJOINT) {
				throw new InvalidPathRelationError(source, target);
			}
			if (determinePathRelationship(target, source) !== PathRelationship.DISJOINT) {
				throw new InvalidPathRelationError(target, source);
			}
			await processRecursively(source_fs, target_fs, source, target);
		} catch (error) {
			process.stderr.write(`An error occurred!\n`);
			if (error instanceof Error) {
				process.stderr.write(`${error.stack ?? ""}`);
			}
		}
	}
};
