#!/usr/bin/env node
define("build/app", [], {
    "name": "@joelek/nsync",
    "timestamp": 1723632210593,
    "version": "0.1.1"
});
define("node_modules/@joelek/ts-autoguard/dist/lib-shared/serialization", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageSerializer = exports.MessageGuardError = exports.MessageGuardBase = void 0;
    ;
    class MessageGuardBase {
        constructor() { }
        is(subject, path) {
            try {
                this.as(subject, path);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        decode(codec, buffer) {
            return this.as(codec.decode(buffer));
        }
        encode(codec, subject) {
            return codec.encode(this.as(subject));
        }
    }
    exports.MessageGuardBase = MessageGuardBase;
    ;
    class MessageGuardError {
        constructor(guard, subject, path) {
            this.guard = guard;
            this.subject = subject;
            this.path = path;
        }
        getSubjectType() {
            if (this.subject === null) {
                return "null";
            }
            if (this.subject instanceof Array) {
                return "array";
            }
            return typeof this.subject;
        }
        toString() {
            return `The type ${this.getSubjectType()} at ${this.path} is type-incompatible with the expected type: ${this.guard.ts()}`;
        }
    }
    exports.MessageGuardError = MessageGuardError;
    ;
    class MessageSerializer {
        constructor(guards) {
            this.guards = guards;
        }
        deserialize(string, cb) {
            let json = JSON.parse(string);
            if ((json != null) && (json.constructor === Object)) {
                if ((json.type != null) && (json.type.constructor === String)) {
                    let type = json.type;
                    let data = json.data;
                    let guard = this.guards[type];
                    if (guard === undefined) {
                        throw "Unknown message type \"" + String(type) + "\"!";
                    }
                    cb(type, guard.as(data));
                    return;
                }
            }
            throw "Invalid message envelope!";
        }
        serialize(type, data) {
            return JSON.stringify({
                type,
                data
            });
        }
    }
    exports.MessageSerializer = MessageSerializer;
    ;
});
define("node_modules/@joelek/ts-autoguard/dist/lib-shared/guards", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/serialization"], function (require, exports, serialization) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Union = exports.UnionGuard = exports.Undefined = exports.UndefinedGuard = exports.Tuple = exports.TupleGuard = exports.StringLiteral = exports.StringLiteralGuard = exports.String = exports.StringGuard = exports.Reference = exports.ReferenceGuard = exports.Key = exports.KeyGuard = exports.Record = exports.RecordGuard = exports.Object = exports.ObjectGuard = exports.NumberLiteral = exports.NumberLiteralGuard = exports.Number = exports.NumberGuard = exports.Null = exports.NullGuard = exports.Intersection = exports.IntersectionGuard = exports.IntegerLiteral = exports.IntegerLiteralGuard = exports.Integer = exports.IntegerGuard = exports.Group = exports.GroupGuard = exports.BooleanLiteral = exports.BooleanLiteralGuard = exports.Boolean = exports.BooleanGuard = exports.Binary = exports.BinaryGuard = exports.BigInt = exports.BigIntGuard = exports.Array = exports.ArrayGuard = exports.Any = exports.AnyGuard = void 0;
    class AnyGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            return subject;
        }
        ts(eol = "\n") {
            return "any";
        }
    }
    exports.AnyGuard = AnyGuard;
    ;
    exports.Any = new AnyGuard();
    class ArrayGuard extends serialization.MessageGuardBase {
        constructor(guard) {
            super();
            this.guard = guard;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Array)) {
                for (let i = 0; i < subject.length; i++) {
                    this.guard.as(subject[i], path + "[" + i + "]");
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `array<${this.guard.ts(eol)}>`;
        }
    }
    exports.ArrayGuard = ArrayGuard;
    ;
    exports.Array = {
        of(guard) {
            return new ArrayGuard(guard);
        }
    };
    class BigIntGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.BigInt)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "bigint";
        }
    }
    exports.BigIntGuard = BigIntGuard;
    ;
    exports.BigInt = new BigIntGuard();
    class BinaryGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if ((subject != null) && (subject instanceof Uint8Array)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "binary";
        }
    }
    exports.BinaryGuard = BinaryGuard;
    ;
    exports.Binary = new BinaryGuard();
    class BooleanGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "boolean";
        }
    }
    exports.BooleanGuard = BooleanGuard;
    ;
    exports.Boolean = new BooleanGuard();
    class BooleanLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `${this.value}`;
        }
    }
    exports.BooleanLiteralGuard = BooleanLiteralGuard;
    ;
    exports.BooleanLiteral = {
        of(value) {
            return new BooleanLiteralGuard(value);
        }
    };
    class GroupGuard extends serialization.MessageGuardBase {
        constructor(guard, name) {
            super();
            this.guard = guard;
            this.name = name;
        }
        as(subject, path = "") {
            return this.guard.as(subject, path);
        }
        ts(eol = "\n") {
            var _a;
            return (_a = this.name) !== null && _a !== void 0 ? _a : this.guard.ts(eol);
        }
    }
    exports.GroupGuard = GroupGuard;
    ;
    exports.Group = {
        of(guard, name) {
            return new GroupGuard(guard, name);
        }
    };
    class IntegerGuard extends serialization.MessageGuardBase {
        constructor(min, max) {
            super();
            this.min = min;
            this.max = max;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Number) && globalThis.Number.isInteger(subject)) {
                let number = subject;
                if (this.min != null && number < this.min) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                if (this.max != null && number > this.max) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                return number;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            var _a, _b;
            if (this.min == null && this.max == null) {
                return "integer";
            }
            else {
                return `integer(${(_a = this.min) !== null && _a !== void 0 ? _a : "*"}, ${(_b = this.max) !== null && _b !== void 0 ? _b : "*"})`;
            }
        }
    }
    exports.IntegerGuard = IntegerGuard;
    ;
    exports.Integer = new IntegerGuard();
    class IntegerLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `${this.value}`;
        }
    }
    exports.IntegerLiteralGuard = IntegerLiteralGuard;
    ;
    exports.IntegerLiteral = {
        of(value) {
            return new IntegerLiteralGuard(value);
        }
    };
    class IntersectionGuard extends serialization.MessageGuardBase {
        constructor(...guards) {
            super();
            this.guards = guards;
        }
        as(subject, path = "") {
            for (let guard of this.guards) {
                guard.as(subject, path);
            }
            return subject;
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let guard of this.guards) {
                lines.push("\t" + guard.ts(eol + "\t"));
            }
            return lines.length === 0 ? "intersection<>" : "intersection<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.IntersectionGuard = IntersectionGuard;
    ;
    exports.Intersection = {
        of(...guards) {
            return new IntersectionGuard(...guards);
        }
    };
    class NullGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if (subject === null) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "null";
        }
    }
    exports.NullGuard = NullGuard;
    ;
    exports.Null = new NullGuard();
    class NumberGuard extends serialization.MessageGuardBase {
        constructor(min, max) {
            super();
            this.min = min;
            this.max = max;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Number)) {
                let number = subject;
                if (this.min != null && number < this.min) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                if (this.max != null && number > this.max) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                return number;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            var _a, _b;
            if (this.min == null && this.max == null) {
                return "number";
            }
            else {
                return `number(${(_a = this.min) !== null && _a !== void 0 ? _a : "*"}, ${(_b = this.max) !== null && _b !== void 0 ? _b : "*"})`;
            }
        }
    }
    exports.NumberGuard = NumberGuard;
    ;
    exports.Number = new NumberGuard();
    class NumberLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `${this.value}`;
        }
    }
    exports.NumberLiteralGuard = NumberLiteralGuard;
    ;
    exports.NumberLiteral = {
        of(value) {
            return new NumberLiteralGuard(value);
        }
    };
    class ObjectGuard extends serialization.MessageGuardBase {
        constructor(required, optional) {
            super();
            this.required = required;
            this.optional = optional;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Object)) {
                for (let key in this.required) {
                    this.required[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                }
                for (let key in this.optional) {
                    if (key in subject && subject[key] !== undefined) {
                        this.optional[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                    }
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let [key, value] of globalThis.Object.entries(this.required)) {
                lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
            }
            for (let [key, value] of globalThis.Object.entries(this.optional)) {
                lines.push(`\t"${key}"?: ${value.ts(eol + "\t")}`);
            }
            return lines.length === 0 ? "object<>" : "object<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.ObjectGuard = ObjectGuard;
    ;
    exports.Object = {
        of(required, optional = {}) {
            return new ObjectGuard(required, optional);
        }
    };
    class RecordGuard extends serialization.MessageGuardBase {
        constructor(guard) {
            super();
            this.guard = guard;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Object)) {
                let wrapped = exports.Union.of(exports.Undefined, this.guard);
                for (let key of globalThis.Object.keys(subject)) {
                    wrapped.as(subject[key], path + "[\"" + key + "\"]");
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `record<${this.guard.ts(eol)}>`;
        }
    }
    exports.RecordGuard = RecordGuard;
    ;
    exports.Record = {
        of(guard) {
            return new RecordGuard(guard);
        }
    };
    class KeyGuard extends serialization.MessageGuardBase {
        constructor(record) {
            super();
            this.record = record;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.String)) {
                let string = subject;
                if (string in this.record) {
                    return string;
                }
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let key of globalThis.Object.keys(this.record)) {
                lines.push(`\t"${key}"`);
            }
            return lines.length === 0 ? "key<>" : "key<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.KeyGuard = KeyGuard;
    ;
    exports.Key = {
        of(record) {
            return new KeyGuard(record);
        }
    };
    class ReferenceGuard extends serialization.MessageGuardBase {
        constructor(guard) {
            super();
            this.guard = guard;
        }
        as(subject, path = "") {
            return this.guard().as(subject, path);
        }
        ts(eol = "\n") {
            return this.guard().ts(eol);
        }
    }
    exports.ReferenceGuard = ReferenceGuard;
    ;
    exports.Reference = {
        of(guard) {
            return new ReferenceGuard(guard);
        }
    };
    class StringGuard extends serialization.MessageGuardBase {
        constructor(pattern) {
            super();
            this.pattern = pattern;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.String)) {
                let string = subject;
                if (this.pattern != null && !this.pattern.test(string)) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                return string;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            if (this.pattern == null) {
                return "string";
            }
            else {
                let pattern = this.pattern != null ? `"${this.pattern.source}"` : "*";
                return `string(${pattern})`;
            }
        }
    }
    exports.StringGuard = StringGuard;
    ;
    exports.String = new StringGuard();
    class StringLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `"${this.value}"`;
        }
    }
    exports.StringLiteralGuard = StringLiteralGuard;
    ;
    exports.StringLiteral = {
        of(value) {
            return new StringLiteralGuard(value);
        }
    };
    class TupleGuard extends serialization.MessageGuardBase {
        constructor(...guards) {
            super();
            this.guards = guards;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Array)) {
                for (let i = 0; i < this.guards.length; i++) {
                    this.guards[i].as(subject[i], path + "[" + i + "]");
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let guard of this.guards) {
                lines.push(`\t${guard.ts(eol + "\t")}`);
            }
            return lines.length === 0 ? "tuple<>" : "tuple<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.TupleGuard = TupleGuard;
    ;
    exports.Tuple = {
        of(...guards) {
            return new TupleGuard(...guards);
        }
    };
    class UndefinedGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if (subject === undefined) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "undefined";
        }
    }
    exports.UndefinedGuard = UndefinedGuard;
    ;
    exports.Undefined = new UndefinedGuard();
    class UnionGuard extends serialization.MessageGuardBase {
        constructor(...guards) {
            super();
            this.guards = guards;
        }
        as(subject, path = "") {
            for (let guard of this.guards) {
                try {
                    return guard.as(subject, path);
                }
                catch (error) { }
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let guard of this.guards) {
                lines.push("\t" + guard.ts(eol + "\t"));
            }
            return lines.length === 0 ? "union<>" : "union<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.UnionGuard = UnionGuard;
    ;
    exports.Union = {
        of(...guards) {
            return new UnionGuard(...guards);
        }
    };
});
define("build/lib/terminal", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stylize = exports.BG_WHITE = exports.BG_CYAN = exports.BG_MAGENTA = exports.BG_BLUE = exports.BG_YELLOW = exports.BG_GREEN = exports.BG_RED = exports.BG_BLACK = exports.FG_WHITE = exports.FG_CYAN = exports.FG_MAGENTA = exports.FG_BLUE = exports.FG_YELLOW = exports.FG_GREEN = exports.FG_RED = exports.FG_BLACK = exports.UNDERLINE = exports.ITALIC = exports.FAINT = exports.BOLD = exports.RESET = void 0;
    exports.RESET = 0;
    exports.BOLD = 1;
    exports.FAINT = 2;
    exports.ITALIC = 3;
    exports.UNDERLINE = 4;
    exports.FG_BLACK = 30;
    exports.FG_RED = 31;
    exports.FG_GREEN = 32;
    exports.FG_YELLOW = 33;
    exports.FG_BLUE = 34;
    exports.FG_MAGENTA = 35;
    exports.FG_CYAN = 36;
    exports.FG_WHITE = 37;
    exports.BG_BLACK = 40;
    exports.BG_RED = 41;
    exports.BG_GREEN = 42;
    exports.BG_YELLOW = 43;
    exports.BG_BLUE = 44;
    exports.BG_MAGENTA = 45;
    exports.BG_CYAN = 46;
    exports.BG_WHITE = 47;
    function stylize(string, ...parameters) {
        return `\x1B[${parameters.join(";")}m` + string + `\x1B[${exports.RESET}m`;
    }
    exports.stylize = stylize;
    ;
});
define("build/lib/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/guards", "fs", "path", "build/lib/terminal"], function (require, exports, guards, libfs, libpath, terminal) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sync = exports.diff = exports.loadConfig = exports.Config = exports.InvalidEntryType = exports.InvalidPathRelationError = exports.ExpectedPathError = void 0;
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
        getPathComponents(path) {
            let resolved = libpath.resolve(path);
            let parsed = libpath.parse(resolved);
            let directories = parsed.dir.split(libpath.sep);
            let entry = parsed.base;
            return [...directories, entry];
        }
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
            process.stdout.write(`${terminal.stylize("create", terminal.FG_GREEN)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(directory)", terminal.FG_CYAN)}\n`);
            if (this.sync) {
                libfs.mkdirSync(path);
                this.statistics.directories_created += 1;
            }
        }
        async createFile(path, readable, timestamp) {
            process.stdout.write(`${terminal.stylize("create", terminal.FG_GREEN)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(file)", terminal.FG_CYAN)}\n`);
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
        formatPath(path) {
            return this.getPathComponents(path).join(libpath.sep);
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
        joinPath(path, entry) {
            return libpath.join(path, entry);
        }
        async listDirectoryEntries(path) {
            return libfs.readdirSync(path).sort();
        }
        async removeDirectory(path) {
            process.stdout.write(`${terminal.stylize("remove", terminal.FG_RED)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(directory)", terminal.FG_CYAN)}\n`);
            if (this.sync) {
                libfs.rmdirSync(path);
                this.statistics.directories_removed += 1;
            }
        }
        async removeDirectoryEntries(target) {
            let entries = await this.listDirectoryEntries(target);
            for (let target_entry of entries.reverse()) {
                let new_target = this.joinPath(target, target_entry);
                let new_target_stat = await this.getStat(new_target);
                if (new_target_stat != null) {
                    if (new_target_stat.type === EntryType.DIRECTORY) {
                        await this.removeDirectoryEntries(new_target);
                        await this.removeDirectory(new_target);
                    }
                    else {
                        await this.removeFile(new_target);
                    }
                }
            }
        }
        async removeFile(path) {
            process.stdout.write(`${terminal.stylize("remove", terminal.FG_RED)} ${terminal.stylize("\"" + this.formatPath(path) + "\"", terminal.FG_YELLOW)} ${terminal.stylize("(file)", terminal.FG_CYAN)}\n`);
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
                            await processRecursively(source_fs, target_fs, source_fs.joinPath(source, source_entry), target_fs.joinPath(target, source_entry));
                        }
                        for (let target_entry of target_entries) {
                            if (!source_entries.has(target_entry)) {
                                await processRecursively(source_fs, target_fs, source_fs.joinPath(source, target_entry), target_fs.joinPath(target, target_entry));
                            }
                        }
                    }
                    else {
                        await target_fs.removeFile(target);
                        for (let source_entry of await source_fs.listDirectoryEntries(source)) {
                            await processRecursively(source_fs, target_fs, source_fs.joinPath(source, source_entry), target_fs.joinPath(target, source_entry));
                        }
                    }
                }
                else {
                    await target_fs.createDirectory(target);
                    for (let source_entry of await source_fs.listDirectoryEntries(source)) {
                        await processRecursively(source_fs, target_fs, source_fs.joinPath(source, source_entry), target_fs.joinPath(target, source_entry));
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
            try {
                let source_fs = new LocalFileSystem(false);
                let target_fs = new LocalFileSystem(false);
                process.stdout.write(`Performing diff from ${terminal.stylize("\"" + source_fs.formatPath(source) + "\"", terminal.FG_YELLOW)} into ${terminal.stylize("\"" + target_fs.formatPath(target) + "\"", terminal.FG_YELLOW)}\n`);
                if (await source_fs.getStat(source) == null) {
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
            try {
                let source_fs = new LocalFileSystem(false);
                let target_fs = new LocalFileSystem(true);
                process.stdout.write(`Performing sync from ${terminal.stylize("\"" + source_fs.formatPath(source) + "\"", terminal.FG_YELLOW)} into ${terminal.stylize("\"" + target_fs.formatPath(target) + "\"", terminal.FG_YELLOW)}\n`);
                if (await source_fs.getStat(source) == null) {
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
});
define("build/cli/index", ["require", "exports", "build/app", "build/lib/index"], function (require, exports, app, lib) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    async function diff() {
        let config = {
            tasks: []
        };
        let source;
        let target;
        function checkTask() {
            if (source != null && target != null) {
                config.tasks.push({
                    source,
                    target
                });
                source = undefined;
                target = undefined;
            }
        }
        let unrecognized_arguments = [];
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
        function checkTask() {
            if (source != null && target != null) {
                config.tasks.push({
                    source,
                    target
                });
                source = undefined;
                target = undefined;
            }
        }
        let unrecognized_arguments = [];
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
});
function define(e,t,n){let l=define;function u(e){return require(e)}null==l.moduleStates&&(l.moduleStates=new Map),null==l.dependentsMap&&(l.dependentsMap=new Map);let i=l.moduleStates.get(e);if(null!=i)throw new Error("Duplicate module found with name "+e+"!");i={initializer:n,dependencies:t,module:null},l.moduleStates.set(e,i);for(let n of t){let t=l.dependentsMap.get(n);null==t&&(t=new Set,l.dependentsMap.set(n,t)),t.add(e)}!function e(t){let n=l.moduleStates.get(t);if(null==n||null!=n.module)return;let i=Array(),o={exports:{}};for(let e of n.dependencies){if("require"===e){i.push(u);continue}if("module"===e){i.push(o);continue}if("exports"===e){i.push(o.exports);continue}try{i.push(u(e));continue}catch(e){}let t=l.moduleStates.get(e);if(null==t||null==t.module)return;i.push(t.module.exports)}"function"==typeof n.initializer?n.initializer(...i):o.exports=n.initializer,n.module=o;let d=l.dependentsMap.get(t);if(null!=d)for(let t of d)e(t)}(e)}