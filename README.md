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
$ npm install -g codegenie-cli
$ codegenie-cli COMMAND
running command...
$ codegenie-cli (--version)
codegenie-cli/0.0.0 darwin-arm64 node-v20.9.0
$ codegenie-cli --help [COMMAND]
USAGE
  $ codegenie-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`codegenie-cli hello PERSON`](#codegenie-cli-hello-person)
* [`codegenie-cli hello world`](#codegenie-cli-hello-world)
* [`codegenie-cli help [COMMANDS]`](#codegenie-cli-help-commands)
* [`codegenie-cli plugins`](#codegenie-cli-plugins)
* [`codegenie-cli plugins:install PLUGIN...`](#codegenie-cli-pluginsinstall-plugin)
* [`codegenie-cli plugins:inspect PLUGIN...`](#codegenie-cli-pluginsinspect-plugin)
* [`codegenie-cli plugins:install PLUGIN...`](#codegenie-cli-pluginsinstall-plugin-1)
* [`codegenie-cli plugins:link PLUGIN`](#codegenie-cli-pluginslink-plugin)
* [`codegenie-cli plugins:uninstall PLUGIN...`](#codegenie-cli-pluginsuninstall-plugin)
* [`codegenie-cli plugins reset`](#codegenie-cli-plugins-reset)
* [`codegenie-cli plugins:uninstall PLUGIN...`](#codegenie-cli-pluginsuninstall-plugin-1)
* [`codegenie-cli plugins:uninstall PLUGIN...`](#codegenie-cli-pluginsuninstall-plugin-2)
* [`codegenie-cli plugins update`](#codegenie-cli-plugins-update)

## `codegenie-cli hello PERSON`

Say hello

```
USAGE
  $ codegenie-cli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/CodeGenieApp/codegenie-cli/blob/v0.0.0/dist/commands/hello/index.ts)_

## `codegenie-cli hello world`

Say hello world

```
USAGE
  $ codegenie-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ codegenie-cli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [dist/commands/hello/world.ts](https://github.com/CodeGenieApp/codegenie-cli/blob/v0.0.0/dist/commands/hello/world.ts)_

## `codegenie-cli help [COMMANDS]`

Display help for codegenie-cli.

```
USAGE
  $ codegenie-cli help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for codegenie-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/lib/commands/help.ts)_

## `codegenie-cli plugins`

List installed plugins.

```
USAGE
  $ codegenie-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ codegenie-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/index.ts)_

## `codegenie-cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ codegenie-cli plugins add plugins:install PLUGIN...

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
  $ codegenie-cli plugins add

EXAMPLES
  $ codegenie-cli plugins add myplugin 

  $ codegenie-cli plugins add https://github.com/someuser/someplugin

  $ codegenie-cli plugins add someuser/someplugin
```

## `codegenie-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ codegenie-cli plugins inspect PLUGIN...

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
  $ codegenie-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/inspect.ts)_

## `codegenie-cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ codegenie-cli plugins install PLUGIN...

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
  $ codegenie-cli plugins add

EXAMPLES
  $ codegenie-cli plugins install myplugin 

  $ codegenie-cli plugins install https://github.com/someuser/someplugin

  $ codegenie-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/install.ts)_

## `codegenie-cli plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ codegenie-cli plugins link PLUGIN

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
  $ codegenie-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/link.ts)_

## `codegenie-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ codegenie-cli plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codegenie-cli plugins unlink
  $ codegenie-cli plugins remove

EXAMPLES
  $ codegenie-cli plugins remove myplugin
```

## `codegenie-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ codegenie-cli plugins reset
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/reset.ts)_

## `codegenie-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ codegenie-cli plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codegenie-cli plugins unlink
  $ codegenie-cli plugins remove

EXAMPLES
  $ codegenie-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/uninstall.ts)_

## `codegenie-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ codegenie-cli plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codegenie-cli plugins unlink
  $ codegenie-cli plugins remove

EXAMPLES
  $ codegenie-cli plugins unlink myplugin
```

## `codegenie-cli plugins update`

Update installed plugins.

```
USAGE
  $ codegenie-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/update.ts)_
<!-- commandsstop -->
