# @joelek/nsync

Synchronization tool for synchronizing files and directories across local and remote file systems.

```
[npx] nsync sync ./private/source ./private/target
```

## Features

### Sync

Nsync can be used to fully synchronize a target file system such that it perfectly replicates the structure and contents of a given source file system.

```
[npx] nsync sync [--overwrite=boolean] <source> <target>
```

```
[npx] nsync sync [--overwrite=boolean] --source=string --target=string
```

The file system referenced to by the `source` argument can point to either a file or a directory structure and must exist for the task to be run successfully. After completion, the file system referenced to by the `target` argument will contain a perfect replica of the structure and contents of the source file system. Nsync achieves this through the creation and deletion of files and directories in the target file system.

Nsync inspects file metadata in order to determine whether two files are equal or not when a file exists at the same location in both the source and target file systems. This behaviour can be configured through the `--overwrite=boolean` argument which when set to `true` forces nsync to re-write all files in the target file system.

### Diff

Nsync can be used to generate a list of the changes required in order to fully synchronize the structure and contents of two file systems, while leaving both systems intact. This is useful for inspecting the changes that will be applied by a `sync` operation before applying any changes to the target file system.

```
[npx] nsync diff [--overwrite=boolean] <source> <target>
```

```
[npx] nsync diff [--overwrite=boolean] --source=string --target=string
```

### Running multiple tasks

Nsync can be configured to run multiple tasks in serial. A task is created as soon as both the `source` and `target` arguments have been provided. Simply specify multiple pairs of `source` and `target` arguments, optionally preceeded by the `--overwrite=boolean` argument, to configure nsync to run multiple tasks in serial.

```
[npx] nsync <sync|diff> [--overwrite=boolean] <source> <target> [--overwrite=boolean] <source> <target>
```

```
[npx] nsync <sync|diff> [--overwrite=boolean] --source=string --target=string [--overwrite=boolean] --source=string --target=string
```

### Configuration files

Nsync can load configuration files from disk through the `--config=string` argument.

```
[npx] nsync <sync|diff> --config=string
```

Config files are required to use the JSON format shown below. When provided with a config file, nsync will ignore all arguments supplied before the `--config=string` argument. Arguments specified after the `--config=string` argument will be interpreted as additions to the config file.

```
{
	"tasks": [
		{
			"source": "./private/source",
			"target": "./private/target",
			"overwrite"?: false
		}
	]
}
```

## Sponsorship

The continued development of this software depends on your sponsorship. Please consider sponsoring this project if you find that the software creates value for you and your organization.

The sponsor button can be used to view the different sponsoring options. Contributions of all sizes are welcome.

Thank you for your support!

### Ethereum

Ethereum contributions can be made to address `0xf1B63d95BEfEdAf70B3623B1A4Ba0D9CE7F2fE6D`.

![](./eth.png)

## Installation

Releases follow semantic versioning and release packages are published using the GitHub platform. Use the following command to install the latest release.

```
npm install [-g] joelek/nsync#semver:^0.1
```

Use the following command to install the very latest build. The very latest build may include breaking changes and should not be used in production environments.

```
npm install [-g] joelek/nsync#master
```

NB: This project targets TypeScript 4 in strict mode.

## Roadmap

* Implement SCP support.
