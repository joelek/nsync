"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = exports.diff = exports.loadConfig = exports.Config = exports.InvalidEntryType = exports.InvalidPathRelationError = exports.ExpectedPathError = void 0;
const guards = require("@joelek/ts-autoguard/dist/lib-shared/guards");
const libfs = require("fs");
const libpath = require("path");
const terminal = require("./terminal");
function getPathComponents(path) {
    let resolved = libpath.resolve(path);
    let parsed = libpath.parse(resolved);
    let directories = parsed.dir.split(libpath.sep);
    let entry = parsed.base;
    return [...directories, entry];
}
;
function formatPathComponents(components) {
    return components.join(libpath.sep);
}
;
function formatPath(path) {
    return formatPathComponents(getPathComponents(path));
}
;
class ExpectedPathError extends Error {
    path;
    constructor(path) {
        super();
        this.path = path;
    }
    get message() {
        return `Expected path "${this.path}" to exist!`;
    }
}
exports.ExpectedPathError = ExpectedPathError;
;
class InvalidPathRelationError extends Error {
    source;
    target;
    constructor(source, target) {
        super();
        this.source = source;
        this.target = target;
    }
    get message() {
        return `Expected paths "${this.source}" and "${this.target}" to have a disjoint path relationship!`;
    }
}
exports.InvalidPathRelationError = InvalidPathRelationError;
;
var PathRelationship;
(function (PathRelationship) {
    PathRelationship[PathRelationship["IDENTICAL"] = 0] = "IDENTICAL";
    PathRelationship[PathRelationship["DISJOINT"] = 1] = "DISJOINT";
    PathRelationship[PathRelationship["CONTAINED"] = 2] = "CONTAINED";
})(PathRelationship || (PathRelationship = {}));
;
function determinePathRelationship(source, target) {
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
}
;
class InvalidEntryType extends Error {
    path;
    constructor(path) {
        super();
        this.path = path;
    }
    get message() {
        return `Expected paths "${this.path}" to be a directory or a file!`;
    }
}
exports.InvalidEntryType = InvalidEntryType;
;
var EntryType;
(function (EntryType) {
    EntryType[EntryType["DIRECTORY"] = 0] = "DIRECTORY";
    EntryType[EntryType["FILE"] = 1] = "FILE";
})(EntryType || (EntryType = {}));
;
class AbstractFileSystem {
    constructor() { }
}
;
class LocalFileSystem extends AbstractFileSystem {
    sync;
    statistics;
    constructor(sync) {
        super();
        this.sync = sync;
        this.statistics = {
            files_created: 0,
            files_removed: 0,
            directories_created: 0,
            directories_removed: 0
        };
    }
    async createDirectory(path) {
        process.stdout.write(`${terminal.stylize("create", terminal.FG_GREEN)} ${terminal.stylize("\"" + formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(directory)", terminal.FG_CYAN)}\n`);
        if (this.sync) {
            libfs.mkdirSync(path);
            this.statistics.directories_created += 1;
        }
    }
    async createFile(path, readable, timestamp) {
        process.stdout.write(`${terminal.stylize("create", terminal.FG_GREEN)} ${terminal.stylize("\"" + formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(file)", terminal.FG_CYAN)}\n`);
        if (this.sync) {
            libfs.writeFileSync(path, Uint8Array.of());
            try {
                await new Promise((resolve, reject) => {
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
            }
            catch (error) {
                libfs.rmSync(path);
                throw error;
            }
        }
    }
    async createReadable(path) {
        let readable = libfs.createReadStream(path);
        return readable;
    }
    async getStat(path) {
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
    async listDirectoryEntries(path) {
        return libfs.readdirSync(path).sort();
    }
    async removeDirectory(path) {
        process.stdout.write(`${terminal.stylize("remove", terminal.FG_RED)} ${terminal.stylize("\"" + formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(directory)", terminal.FG_CYAN)}\n`);
        if (this.sync) {
            libfs.rmdirSync(path);
            this.statistics.directories_removed += 1;
        }
    }
    async removeDirectoryEntries(target) {
        let entries = await this.listDirectoryEntries(target);
        for (let target_entry of entries.reverse()) {
            let new_target = libpath.join(target, target_entry);
            let new_target_stat = await this.getStat(new_target);
            if (new_target_stat != null) {
                if (new_target_stat.type === EntryType.DIRECTORY) {
                    this.removeDirectoryEntries(new_target);
                    this.removeDirectory(new_target);
                }
                else {
                    this.removeFile(new_target);
                }
            }
        }
    }
    async removeFile(path) {
        process.stdout.write(`${terminal.stylize("remove", terminal.FG_RED)} ${terminal.stylize("\"" + formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(file)", terminal.FG_CYAN)}\n`);
        if (this.sync) {
            libfs.rmSync(path);
            this.statistics.files_removed += 1;
        }
    }
}
;
async function processRecursively(source_fs, target_fs, source, target) {
    let source_stat = await target_fs.getStat(source);
    let target_stat = await target_fs.getStat(target);
    if (source_stat != null) {
        if (source_stat.type === EntryType.DIRECTORY) {
            if (target_stat != null) {
                if (target_stat.type === EntryType.DIRECTORY) {
                    let source_entries = new Set(await source_fs.listDirectoryEntries(source));
                    let target_entries = new Set(await target_fs.listDirectoryEntries(target));
                    for (let source_entry of source_entries) {
                        await processRecursively(source_fs, target_fs, libpath.join(source, source_entry), libpath.join(target, source_entry));
                    }
                    for (let target_entry of target_entries) {
                        if (!source_entries.has(target_entry)) {
                            await processRecursively(source_fs, target_fs, libpath.join(source, target_entry), libpath.join(target, target_entry));
                        }
                    }
                }
                else {
                    await target_fs.removeFile(target);
                    for (let source_entry of await source_fs.listDirectoryEntries(source)) {
                        await processRecursively(source_fs, target_fs, libpath.join(source, source_entry), libpath.join(target, source_entry));
                    }
                }
            }
            else {
                await target_fs.createDirectory(target);
                for (let source_entry of await source_fs.listDirectoryEntries(source)) {
                    await processRecursively(source_fs, target_fs, libpath.join(source, source_entry), libpath.join(target, source_entry));
                }
            }
        }
        else {
            if (target_stat != null) {
                if (target_stat.type === EntryType.DIRECTORY) {
                    await target_fs.removeDirectoryEntries(target);
                    await target_fs.removeDirectory(target);
                    await target_fs.createFile(target, await source_fs.createReadable(source), source_stat.timestamp);
                }
                else {
                    let timestamp_difference = source_stat.timestamp !== target_stat.timestamp;
                    let size_difference = source_stat.size !== target_stat.size;
                    if (timestamp_difference || size_difference) {
                        await target_fs.removeFile(target);
                        await target_fs.createFile(target, await source_fs.createReadable(source), source_stat.timestamp);
                    }
                }
            }
            else {
                await target_fs.createFile(target, await source_fs.createReadable(source), source_stat.timestamp);
            }
        }
    }
    else {
        if (target_stat != null) {
            if (target_stat.type === EntryType.DIRECTORY) {
                await target_fs.removeDirectoryEntries(target);
                await target_fs.removeDirectory(target);
            }
            else {
                await target_fs.removeFile(target);
            }
        }
    }
}
;
exports.Config = guards.Object.of({
    tasks: guards.Array.of(guards.Object.of({
        source: guards.String,
        target: guards.String
    }))
});
function loadConfig(path) {
    let string = libfs.readFileSync(path, "utf-8");
    let json = JSON.parse(string);
    return exports.Config.as(json);
}
exports.loadConfig = loadConfig;
;
async function diff(config) {
    for (let { source, target } of config.tasks) {
        process.stdout.write(`Performing diff from ${terminal.stylize("\"" + formatPath(source) + "\"", terminal.FG_YELLOW)} into ${terminal.stylize("\"" + formatPath(target) + "\"", terminal.FG_YELLOW)}\n`);
        let source_fs = new LocalFileSystem(false);
        let target_fs = new LocalFileSystem(false);
        try {
            if (source_fs.getStat(source) == null) {
                throw new ExpectedPathError(source);
            }
            if (determinePathRelationship(source, target) !== PathRelationship.DISJOINT) {
                throw new InvalidPathRelationError(source, target);
            }
            if (determinePathRelationship(target, source) !== PathRelationship.DISJOINT) {
                throw new InvalidPathRelationError(target, source);
            }
            await processRecursively(source_fs, target_fs, source, target);
        }
        catch (error) {
            process.stderr.write(`An error occurred!\n`);
            if (error instanceof Error) {
                process.stderr.write(`${error.stack ?? ""}`);
            }
        }
    }
}
exports.diff = diff;
;
async function sync(config) {
    for (let { source, target } of config.tasks) {
        process.stdout.write(`Performing sync from ${terminal.stylize("\"" + formatPath(source) + "\"", terminal.FG_YELLOW)} into ${terminal.stylize("\"" + formatPath(target) + "\"", terminal.FG_YELLOW)}\n`);
        try {
            let source_fs = new LocalFileSystem(false);
            let target_fs = new LocalFileSystem(true);
            if (source_fs.getStat(source) == null) {
                throw new ExpectedPathError(source);
            }
            if (determinePathRelationship(source, target) !== PathRelationship.DISJOINT) {
                throw new InvalidPathRelationError(source, target);
            }
            if (determinePathRelationship(target, source) !== PathRelationship.DISJOINT) {
                throw new InvalidPathRelationError(target, source);
            }
            await processRecursively(source_fs, target_fs, source, target);
        }
        catch (error) {
            process.stderr.write(`An error occurred!\n`);
            if (error instanceof Error) {
                process.stderr.write(`${error.stack ?? ""}`);
            }
        }
    }
}
exports.sync = sync;
;
