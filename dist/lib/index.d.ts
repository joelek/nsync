import * as guards from "@joelek/ts-autoguard/dist/lib-shared/guards";
export declare class UnsupportedProtocolError extends Error {
    protected protocol: string;
    constructor(protocol: string);
    get message(): string;
}
export declare class ExpectedPathError extends Error {
    protected path: string;
    constructor(path: string);
    get message(): string;
}
export declare class InvalidPathRelationError extends Error {
    protected source: string;
    protected target: string;
    constructor(source: string, target: string);
    get message(): string;
}
export declare class InvalidEntryType extends Error {
    protected path: string;
    constructor(path: string);
    get message(): string;
}
export declare const Config: guards.ObjectGuard<{
    tasks: guards.Array<{
        source: string;
        target: string;
        overwrite?: boolean | undefined;
    }>;
}, {}>;
export type Config = ReturnType<typeof Config["as"]>;
export declare function loadConfig(path: string): Config;
export declare function diff(config: Config): Promise<void>;
export declare function sync(config: Config): Promise<void>;
