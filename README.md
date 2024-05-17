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
@codegenie/cli/1.4.0 darwin-arm64 node-v20.12.2
$ @codegenie/cli --help [COMMAND]
USAGE
  $ @codegenie/cli COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`@codegenie/cli autocomplete [SHELL]`](#codegeniecli-autocomplete-shell)
* [`@codegenie/cli generate`](#codegeniecli-generate)
* [`@codegenie/cli help [COMMANDS]`](#codegeniecli-help-commands)
* [`@codegenie/cli login`](#codegeniecli-login)
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

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.0.5/lib/commands/autocomplete/index.ts)_

## `@codegenie/cli generate`

Generate an application

```
USAGE
  $ @codegenie/cli generate [--json] [-n <value>] [-d <value>] [--deploy] [-p <value>] [-r]
    [--AppDefinitionOnly] [--idp <value>]

FLAGS
  -d, --description=<value>        Describe your application in plain English and Code Genie will do its best to create
                                   an App Definition and data model for you.
  -n, --name=<value>               Name of the app you're generating.
  -p, --awsProfileToCopy=<value>   [default: default] The AWS Profile to copy in the ~/.aws/credentials file and used to
                                   deploy the application. Defaults to the 'default' profile. Specify --noCopyAwsProfile
                                   to skip this step
  -r, --replaceAppDefinition       Replaces the current .codegenie directory.
      --deploy                     Deploys the generated application to AWS using the --awsProfileToCopy creds. Creates
                                   new profiles in ~/.aws/credentials based on your app name and stages by copying the
                                   --awsProfileToCopy creds.
      --generateAppDefinitionOnly  Generates app definition only (run `@codegenie/cli generate` without `--description`
                                   to generate source code).
      --idp=<value>...             Supported identity providers. Valid values include "Google" and "SAML". Can be
                                   specified multiple times to enable multiple IDPs.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Generate an application

  Generate an application based on a description or a App Definition defined in .codegenie

ALIASES
  $ @codegenie/cli generate

EXAMPLES
  $ @codegenie/cli generate --description "A to-do list application called getitdone" --deploy
  generating app...
  $ @codegenie/cli generate --description "A banking app" --deploy
  generating app...
```

_See code: [dist/commands/generate.ts](https://github.com/CodeGenieApp/cli/blob/v1.4.0/dist/commands/generate.ts)_

## `@codegenie/cli help [COMMANDS]`

Display help for @codegenie/cli.

```
USAGE
  $ @codegenie/cli help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for @codegenie/cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/lib/commands/help.ts)_

## `@codegenie/cli login`

Login

```
USAGE
  $ @codegenie/cli login

DESCRIPTION
  Login

EXAMPLES
  $ @codegenie/cli login
```

_See code: [dist/commands/login.ts](https://github.com/CodeGenieApp/cli/blob/v1.4.0/dist/commands/login.ts)_

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

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v4.1.7/dist/commands/update.ts)_
<!-- commandsstop -->

# Release

```sh
npm run build
npm version (major|minor|patch) # bumps version, updates README, adds git tag
npm publish --access=public
```

See [Oclif Release Docs](https://oclif.io/docs/releasing/) for more details.
