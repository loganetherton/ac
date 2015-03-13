### Setting Up a Windows Environment

This document describes the required steps to install the system on Windows.

#### 1. Install VirtualBox

Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads). Accept the default settings and grant all requested permissions.

#### 2. Install Vagrant

Download and install [Vagrant](https://www.vagrantup.com/downloads.html). Accept the default settings and grant all requested permissions. You'll be asked to restart your PC when the installation is done. 

#### 3. Install Git

Download and install [Git](http://git-scm.com/downloads). Accept the default settings. You now have an application called Git Bash which you may want to pin to your taskbar for quick access. It will be used often for version control.

#### 4. Install PHP

Download [PHP 5.6](http://windows.php.net/download/) (VC11 x64 Thread Safe, Zip format) and extract the compressed file into `C:\php56`.

##### Adding PHP to Path
1. Bring up the Run window (`Win+R`), type `sysdm.cpl`, and click OK. The `System Properties` window will be displayed.
2. Click the `Advanced` tab and click the `Environment Variables...` button.
3. Under `System Variables`, double click `Path`.
4. At the end of `Variable value`, append `;C:\php56` and click OK.
5. Click OK on the `System Variables` window to save your changes.

Start (or restart) Git Bash, and type `php -v`. If you see the version information displayed, then you have successfully installed PHP.

##### Install Composer

PHP Composer is needed to initialize Laravel's Homestead. Download the [Composer Windows installer](https://getcomposer.org/doc/00-intro.md#installation-windows). However, if you try to run the installer, you'll get an error indicating that the OpenSSL extension is missing.

###### Enable OpenSSL
1. Copy `C:\php56\php.ini-development` to `C:\php56\php.ini`.
2. Open the `php.ini` in a text editor and change the line that reads `;extension=php_openssl.dll` to `extension=ext\php_openssl.dll`

You can now run the Composer installer. Accept all default settings, then restart Git Bash.

#### 5. Install Node

Download and install [Node.js](http://nodejs.org/download/). Accept all default settings and grant any requested permissions.

#### 6. Install Ruby

Install the latest version of Ruby using [RubyInstaller](http://rubyinstaller.org/downloads/). Check each of the three checkboxes on the second step, and continue with the installation process. Restart Git Bash after completing the installation.

##### Install Compass

Compass, which is available via [RubyGems](https://rubygems.org/), Ruby's package manager, must also be installed. However, running the installation command will return an error indicating that the certificate verification has failed. To [fix the problem](https://gist.github.com/luislavena/f064211759ee0f806c88), download the [new pem file](https://raw.githubusercontent.com/rubygems/rubygems/master/lib/rubygems/ssl_certs/AddTrustExternalCARoot-2048.pem) and place it in `C:\Ruby21\lib\ruby\2.1.0\rubygems\ssl_certs`.

You can now install compass by running the following commands:

```bash
gem update --system
gem install compass
```

#### 7. Clone the codebase

Open Git Bash and navigate to the location where you want to store the code. The rest of this guide assumes that the code is stored at `E:\Code`.

```
cd E:\Code
git clone https://github.com/ascope/back-end.git
git clone https://github.com/ascope/front-end.git
```

You will be prompted to provide your GitHub username and password. After cloning has finished, the code will be available in `E:\Code\back-end` and `E:\Code\front-end`. 

#### 8. Setup Your SSH Key

Open Git Bash and run:

```
ssh-keygen -t rsa -C "you@homestead"
```

Accept the default location and do not specify a password for the key.

#### 9. Install Homestead

##### 1. Download and add the Laravel Vagrant Box

Open Git Bash and paste:

```
vagrant box add laravel/homestead
```

##### 2. Install the Homestead CLI Tool

Once the Homestead box has been added to your Vagrant installation, the Homestead CLI tool can be installed using Composer. The following command will install the tool globally:

```
composer global require "laravel/homestead=~2.0"
```

##### 3. Adding Homestead to Path

Add `;~/AppData/Roaming/Composer/vendor/laravel/homestead` to the system path. This will allow the Homestead executable to be found when you run the `homestead` command in the terminal. Restart Git Bash once it has been added to the path.

_Note: Please refer to "Adding PHP to Path" for specific instructions on adding to the system path._

#### 10. Initialize Homestead

Create the Homestead.yaml configuration file by running the following:

```
homestead init
```

`Homestead.yaml` will now be available at `C:\Users\<username>\.homestead`. Open this file in a text editor, and replace its content with the following:

```yaml
    ---
    ip: "192.168.10.10"
    memory: 2048
    cpus: 1
    
    authorize: ~/.ssh/id_rsa.pub
    
    keys:
        - ~/.ssh/id_rsa
    
    folders:
        - map: E:/Code
          to: /home/vagrant/Code
    
    sites:
        - map: homestead.app
          to: /home/vagrant/Code/Laravel/public
        - map: clientx.dev-api.appraisalscope.local
          to: /home/vagrant/Code/ascopev2/backend/public
    
    databases:
        - homestead
        - appraisalscope
    
    variables:
        - key: APP_ENV
          value: local
```

Adjust the path to your local copy of the Appraisal Scope code in the configuration above, if necessary.

Normally at this point, you should be able to type `homestead ssh` inside your terminal to access the virtual box. Sadly, due to a [bug in Homestead 2.0.8](https://github.com/laravel/homestead/commit/167135bbac3966be7ac05446c7da0d8bee50c34e), you need to manually make the following changes (otherwise running `homestead ssh` will return an error message stating that vagrant is not a recognized command):

File: `C:\Users\username\AppData\Roaming\Composer\vendor\laravel\homestead\src\UpCommand.php`

Change:
`$process = new Process($command, realpath(__DIR__.'/../'), $_ENV, null, null);`  
To:  
`$process = new Process($command, realpath(__DIR__.'/../'), null, null, null);`

File: `C:\Users\username\AppData\Roaming\Composer\vendor\laravel\homestead\src\SshCommand.php`

Change:
`passthru('VAGRANT_DOTFILE_PATH="~/.homestead/.vagrant" vagrant ssh');`  
To:  
`passthru('vagrant ssh');` 

This will only fix the two commands that we need. You can run now run `homestead up` then `homestead ssh` to access the box (the first up run will take a little longer.)

#### 11. Using PuTTY

For some reason, Git Bash stops accepting new input after a few seconds of inactivity when connected to the virtual box. If you're not facing this issue on your machine, you can keep using Git Bash, otherwise follow the steps below to connect using PuTTY SSH Client.

##### 1. Download PuTTY

[Download](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html) the latest version of PuTTY (putty.exe). You may place the executable anywhere on your computer. It's a good idea to pin to the taskbar as you'll frequently use it.

##### 2. Convert SSH key

The SSH key we generated earlier must be converted to PuTTY Private Key format in order to be used by PuTTY. This can be done using [PuTTYgen](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html) (puttygen.exe).

1. Open PuTTYgen and from the main menu, select _Conversions -> Import key_.
2. Select the private key located at `C:\Users\username\.ssh\id_rsa`
3. Click Save private key. Do not enter a passphrase and save the file at `C:\Users\username\.ssh\putty.ppk`

##### 3. Connecting via PuTTY

1. Launch PuTTY executable you download earlier.
2. In _Host Name (or IP address)_ field enter _192.168.10.10_
3. From _Colours_ under _Category_ check _Use System colours_ if you prefer white background with black text.
4. From _Connection -> SSH -> Auth_, specify putty.ppk for _Private key file for authentication_ input.
5. Go back to the first screen (first tree option; _Session_), type Homestead in _Saved Sessions_ input and click save.
6. You can now connect to the machine by double clicking _Homestead_ under _Saved Sessions_. When prompt to provide the user name, type _vagrant_.

#### 12. Local domains

The _hosts file_ must be modified in order to emulate real customer URLs.

1. Right click on _Notepad_ and click _Run as administrator_.
2. Open the hosts file located at `C:\Windows\System32\drivers\etc\hosts` using the open instance of Notepad.
3. Append the following to the end of the file:
```
127.0.0.1      clientx.appraisalscope.local
192.168.10.10  clientx.dev-api.appraisalscope.local
192.168.10.10  homestead.app
```

#### 13. Database connection and data import

To connect to your MySQL database server from your main machine via Navicat, you should connect to localhost and port 33060. The username and password for both databases is homestead / secret.

You'll also need to import the development database once you're connected.

#### 14. Install packages

##### 1. Front-end packages

1. Append the following to your Path: `;C:\Users\username\AppData\Roaming\npm;C:\Program Files\nodejs\;` and relaunch Git Bash.
2. Paste the commands provided in [Preparing a new development environment](https://github.com/ascope/ascopev2/wiki/Preparing-a-new-development-environment#front-end) guide.

Note how we are installing the front-end requirements outside of Homestead. This is needed because the front-end application interact with the browser (automatic refresh, testing, etc.)

You can now install the front-end packages as specified in [Initializing a local development environment](https://github.com/ascope/ascopev2/wiki/Initializing-a-local-development-environment#initializing-the-front-end-app) guide under _Initializing the front-end app_.

##### 2. Back-end packages

Follow [Initializing the backend-end app](https://github.com/ascope/ascopev2/wiki/Initializing-a-local-development-environment#initializing-the-backend-end-app) steps. These commands must be executed from inside Homestead.

#### 15. Launching the system

See [Firing up development environment](https://github.com/ascope/ascopev2/wiki/Firing-up-development-environment) guide.

#### Troubleshooting

> I am getting _The program can’t start because MSVCR110.dll is missing from your computer. try reinstalling the program to fix this problem._

You need to install [Visual C++ Redistributable](http://www.microsoft.com/en-us/download/details.aspx?id=30679).

> I made some adjustments on Homestead.yaml configuration file, how can I reflect my changes on the virtual machine?

Run the following commands from Git Bash:
```
cd "C:\Users\username\AppData\Roaming\Composer\vendor\laravel\homestead"
vagrant provision
```

#### External Resources

- [Installing Laravel on Windows - Treehouse video tutorial](https://www.youtube.com/watch?v=p0veZd9mtGc)