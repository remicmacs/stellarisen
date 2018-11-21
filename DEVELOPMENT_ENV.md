# Development environment

The dev environment used is composed of a VM provisionned and orchestrated with
Vagrant and Puppet. The [website PuPHPet] provides the Puppet configuration for
provisionning the VM.


## First deployment

### Requirements

* Virtualbox
* Vagrant >= 2.0

### Deployment

```bash
# unzip the vagrantbox.zip file in the local folder.
$ unzip vagrantbox.zip
# Launch set_hosts.sh script
$ sudo sh set_hosts.sh
# Powering VM and provisionning it with Vagrant
$ vagrant up
```
## Use of Vagrant box

The root of the Vagrant environment is the folder including `Vagrantfile` and
the `.vagrant` folder. All commands must be launched from the Vagrant root
folder.

### Main commands

First start and provisionnig of the development server :

```shell
$ vagrant up
```

Force provisionning of VM after modification :

```shell
$ vagrant provision
```

Cleanly suspend the development server :

```shell
$ vagrant suspend
```

Force kill the production server (might break things) :

```shell
$ vagrant halt
```

When there is a problem :

```sh
$ # You can go grab a coffee
$ vagrant destroy && vagrant up
```

Connect to VM host

```sh
$ vagrant ssh
```

[More informations on this page](https://puphpet.com/#help)

## Debug JS in Firefox

Debbugging in the browser for client-side JS code requires extensions in editors
like Atom and VS Code. Some IDEs like Webstorm include a connector by default.

* [Atom extension]()
* [VS Code extension](https://github.com/hbenl/vscode-firefox-debug)

Add this configuration with theses properties in the IDE debugger :


For more information on the Firefox Debugger, see [this MDN page](https://developer.mozilla.org/en-US/docs/Tools/Debugger).

## PHP & XDebug

All XDebug server configuration is taken care of in the Vagrant box. All
XDebug settings can be tweaked in the `puphpet/config.yaml` file and applied
with `vagrant provision`.

### With VS Code

The configuration properties for all IDE's and editor's debbugers might look
like this JSON file :

```json
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9000,
      //Your project's path in the server
      "pathMappings": {
          "/var/www/stellarisen/": "${workspaceFolder}/",
      },
      "stopOnEntry": true
    }
```

This example is specifically the debugger configuration for VS Code, but all
debuggers needs roughly the same informations.

Some might need extensions. VS Code needs `php-debug` extension to be able to
work.

### With Atom
With Atom, packages `php-debug` and `atom-debug-ui` are recommended to use
XDebug. The `atom-ide-ui` debug panel won't work with php-debug, so it is
recommendend to disable it during PHP debugging to avoid confusion between
breakpoints set by `atom-debug-ui` and `atom-ide-ui`'s debugger.

Settings > atom-ide-ui > Enabled features > Enable debugger > set to "Never
enabled"

The extension needs to now the path mappings of the local files to the remote
server files.

The mappings is stored in a JSON object. For example :

```json
[
	{
		"localPath":"/the/absolute/path/to/stellarisen",
		"remotePath":"/var/www/stellarisen"
	},
	{
		"remotePath":"/var/www/stellarisen/testfolder",
		"localPath":"/the/absolute/path/to/stellarisen/testfolder"
	}
]
```

With VS Code, one can use the `php-debug` extension that is better integrated
with the native debugger of the editor.

Configuration of the debugger then is stored with other debugger configuration
in file `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      // ... Other configurations, like for client-side JS debugging
    },
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9000,
      //Your project's path in the server
      "pathMappings": {
          "/var/www/stellarisen/": "${workspaceFolder}/",
      },
      "stopOnEntry": true
    }
  ]
}
```

## Recovering server dependancies

The [Composer dependancy manager](https://getcomposer.org/) is used to retrieve
all libraries needed by the API, including development server.

In `${StellarisenRoot}/api` folder :

```shell
$ composer install
```
TODO : add first Composer commands to Puppet shell provisionning of VM.