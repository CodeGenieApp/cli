# Code Genie CLI

```sh
npx @codegenie/cli generate --description "An app that lets users upload photos, location, time, species and other information so that Wildlife Rescuers can get notified and respond to reports of injured wildlife in their area."
```

<!-- toc -->
* [Code Genie CLI](#code-genie-cli)
* [Usage](#usage)
* [Commands](#commands)
* [Release](#release)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @codegenie/cli
$ @codegenie/cli COMMAND
running command...
$ @codegenie/cli (--version)
@codegenie/cli/1.5.1 darwin-arm64 node-v20.12.2
$ @codegenie/cli --help [COMMAND]
USAGE
  $ @codegenie/cli COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`@codegenie/cli autocomplete [SHELL]`](#codegeniecli-autocomplete-shell)
* [`@codegenie/cli help [COMMANDS]`](#codegeniecli-help-commands)
* [`@codegenie/cli update [CHANNEL]`](#codegeniecli-update-channel)

## `@codegenie/cli autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ @codegenie/cli autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ @codegenie/cli autocomplete

  $ @codegenie/cli autocomplete bash

  $ @codegenie/cli autocomplete zsh

  $ @codegenie/cli autocomplete powershell

  $ @codegenie/cli autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.0.18/src/commands/autocomplete/index.ts)_

## `@codegenie/cli help [COMMANDS]`

Display help for @codegenie/cli.

```
USAGE
  $ @codegenie/cli help [COMMANDS...] [-n]

ARGUMENTS
  COMMANDS...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for @codegenie/cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/src/commands/help.ts)_

## `@codegenie/cli update [CHANNEL]`

update the @codegenie/cli CLI

```
USAGE
  $ @codegenie/cli update [CHANNEL] [-a] [--force] [-i | -v <value>]

FLAGS
  -a, --available        See available versions.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
      --force            Force a re-download of the requested version.

DESCRIPTION
  update the @codegenie/cli CLI

EXAMPLES
  Update to the stable channel:

    $ @codegenie/cli update stable

  Update to a specific version:

    $ @codegenie/cli update --version 1.0.0

  Interactively select version:

    $ @codegenie/cli update --interactive

  See available versions:

    $ @codegenie/cli update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v4.2.13/src/commands/update.ts)_
<!-- commandsstop -->

# Release

```sh
npm run build
npm version (major|minor|patch) # bumps version, updates README, adds git tag
npm publish --access=public
```

See [Oclif Release Docs](https://oclif.io/docs/releasing/) for more details.
