# Dev environment

The dev environment used is composed of a VM provisionned and orchestrated with
Vagrant and Puppet. The website PuPHPet provides the Puppet configuration for
provisionning the VM.

TODO : save config.yaml custom file

## Use of Vagrant box

Provision the VM & start the development server :

```shell
$ vagrant up
```

(in the same folder as the Vagrantfile)

[More informations on this page](https://puphpet.com/#help)

### Main commands

When there is a problem :

```sh
$ # You can go grab a coffee
$ vagrant destroy && vagrant up
```

Connect to VM host

```sh
$ vagrant ssh
```

### End of session
Do not forget to suspend the VM to avoid any problem for the next session :

```sh
$ vagrant suspend
```

## Debug JS in Firefox
Add this configuration with theses properties in the IDE debugger :


## XDebug
Set this configuration in the properties of the IDE debugger :

```json
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9000,
      //Your project's path in the server
      "pathMappings": {
          "/var/www/stellarisen": "${workspaceRoot}/server"
      }
```

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
		"localPath":"/the/absolute/path/to/stellarisen,
		"remotePath":"/var/www/stellarisen"
	},
	{
		"remotePath":"/the/absolute/path/to/stellarisen/testfolder",
		"localPath":"/home/remi/AP4/stellarisen/testfolder"
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