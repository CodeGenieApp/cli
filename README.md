oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @codegenie/cli
$ @codegenie/cli COMMAND
running command...
$ @codegenie/cli (--version)
@codegenie/cli/0.0.1 darwin-arm64 node-v20.9.0
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
* [`@codegenie/cli login [FILE]`](#codegeniecli-login-file)
* [`@codegenie/cli plugins`](#codegeniecli-plugins)
* [`@codegenie/cli plugins:install PLUGIN...`](#codegeniecli-pluginsinstall-plugin)
* [`@codegenie/cli plugins:inspect PLUGIN...`](#codegeniecli-pluginsinspect-plugin)
* [`@codegenie/cli plugins:install PLUGIN...`](#codegeniecli-pluginsinstall-plugin-1)
* [`@codegenie/cli plugins:link PLUGIN`](#codegeniecli-pluginslink-plugin)
* [`@codegenie/cli plugins:uninstall PLUGIN...`](#codegeniecli-pluginsuninstall-plugin)
* [`@codegenie/cli plugins reset`](#codegeniecli-plugins-reset)
* [`@codegenie/cli plugins:uninstall PLUGIN...`](#codegeniecli-pluginsuninstall-plugin-1)
* [`@codegenie/cli plugins:uninstall PLUGIN...`](#codegeniecli-pluginsuninstall-plugin-2)
* [`@codegenie/cli plugins update`](#codegeniecli-plugins-update)
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
  $ @codegenie/cli generate [--json] [--name <value>] [-d <value>] [--deploy] [-p <value>] [-n] [-r]

FLAGS
  -d, --description=<value>       Describe your application in plain English and Code Genie will do its best to create
                                  an App Definition and data model for you.
  -n, --noCopyAwsProfile          Skips copying an AWS profile in the ~/.aws/credentials file. You must specify a
                                  your-app-name_dev (as well as _staging and _prod) profile before you can deploy the
                                  app.
  -p, --awsProfileToCopy=<value>  [default: default] The AWS Profile to copy in the ~/.aws/credentials file and used to
                                  deploy the application. Defaults to the 'default' profile. Specify
                                  --no-copy-aws-profile to skip this step
  -r, --replaceAppDefinition      Replaces the current .codegenie directory.
      --deploy                    Deploys the generated application to AWS using the --awsProfileToCopy creds. Creates
                                  new profiles in ~/.aws/credentials based on your app name and stages by copying the
                                  --awsProfileToCopy creds.
      --name=<value>              Name of the app you're generating.

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

_See code: [dist/commands/generate.ts](https://github.com/CodeGenieApp/cli/blob/v0.0.1/dist/commands/generate.ts)_

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

## `@codegenie/cli login [FILE]`

describe the command here

```
USAGE
  $ @codegenie/cli login [FILE] [-n <value>] [-f]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ @codegenie/cli login
```

_See code: [dist/commands/login.ts](https://github.com/CodeGenieApp/cli/blob/v0.0.1/dist/commands/login.ts)_

## `@codegenie/cli plugins`

List installed plugins.

```
USAGE
  $ @codegenie/cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ @codegenie/cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/index.ts)_

## `@codegenie/cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ @codegenie/cli plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ @codegenie/cli plugins add

EXAMPLES
  $ @codegenie/cli plugins add myplugin 

  $ @codegenie/cli plugins add https://github.com/someuser/someplugin

  $ @codegenie/cli plugins add someuser/someplugin
```

## `@codegenie/cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ @codegenie/cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ @codegenie/cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/inspect.ts)_

## `@codegenie/cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ @codegenie/cli plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ @codegenie/cli plugins add

EXAMPLES
  $ @codegenie/cli plugins install myplugin 

  $ @codegenie/cli plugins install https://github.com/someuser/someplugin

  $ @codegenie/cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/install.ts)_

## `@codegenie/cli plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ @codegenie/cli plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ @codegenie/cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/link.ts)_

## `@codegenie/cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ @codegenie/cli plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ @codegenie/cli plugins unlink
  $ @codegenie/cli plugins remove

EXAMPLES
  $ @codegenie/cli plugins remove myplugin
```

## `@codegenie/cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ @codegenie/cli plugins reset
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/reset.ts)_

## `@codegenie/cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ @codegenie/cli plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ @codegenie/cli plugins unlink
  $ @codegenie/cli plugins remove

EXAMPLES
  $ @codegenie/cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/uninstall.ts)_

## `@codegenie/cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ @codegenie/cli plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ @codegenie/cli plugins unlink
  $ @codegenie/cli plugins remove

EXAMPLES
  $ @codegenie/cli plugins unlink myplugin
```

## `@codegenie/cli plugins update`

Update installed plugins.

```
USAGE
  $ @codegenie/cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/update.ts)_

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
