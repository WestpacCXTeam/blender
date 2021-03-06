BLENDER
=======

> This is the repository for the Westpac GUI Blender. The blender dynamically builds each selected module that is posted to it and zips it up into a nice
> download.


### Content

* [Install](#install)
* [Build](#build)
* [Tests](#tests)
* [Release History](#release-history-remote)
* [License](#license)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


### Install

#### Server

The blender is build to be installed behind an NGINX proxy with fallback pages.

NGINX config:

```shell
server {
	listen       443 ssl http2;
	# the main server stuff etc...

	# Node proxy
	#
	# blender server
	#
	location /api/blender/ {
		root   /var/www/html/;
		proxy_pass              http://localhost:1337;
		proxy_redirect          http://localhost:1337/  /api/blender/;

		proxy_redirect          off;
		proxy_pass_header       Server;
		proxy_set_header        X-Real-IP $remote_addr;
		proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header        X-Scheme $scheme;
		proxy_set_header        Host $http_host;
		proxy_set_header        X-NginX-Proxy true;
		proxy_connect_timeout   5;
		proxy_read_timeout      240;
		proxy_intercept_errors  on;

		# Put server in maintenance mode if page exists
		if (-f $document_root/construction.html) {
			return 503;
		}

		# error pages
		error_page  400          /blender-error.html;
		error_page  401          /blender-error.html;
		error_page  402          /blender-error.html;
		error_page  403          /blender-error.html;
		error_page  404          /blender-error.html;
		error_page  500 502 504  /blender-error.html;
		error_page  503          @maintenance;
	}
}
```

#### CRON task

To make sure the blender is started when the system has to reboot, make sure you add a cron task after reboot:

```shell
chmod 700 /www/GUI/blender/starter.sh #the starter.sh of this repo
crontab -e
```

and add:

```shell
@reboot /www/GUI/blender/starter.sh
```

#### FOREVER node deamon

Now we still have to make sure the node app is restarted if it crashes for some uncaught reason. Install [forever](https://github.com/foreverjs/forever) and
register the task:

```shell
npm i forever -g
forever start -l blender.log --append -o blenderOut.log -e blenderError.log server.js
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


### Build

To build the blender make sure you got all dependencies installed via `yarn` and `grunt` to build the server files.
You will need a `.env` file in your root directory with the env vars for your environment. There is a `.env-template` file that mentions all required variables without their values.

To start the blender run:

```shell
node remote/server-dev.js
```

This will spin up the blender in debug mode. You can set the debug level in `Blender.DEBUGLEVEL`.

Production is run by:

```shell
node remote/server.js
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


### Tests

The test in `tests/remote-test.js` will request a multitude of configurations from the locally run blender, unzip the files and compare each folder against
a hash checksum. The test can be scaled up and new configurations can be added on the fly.

To run the test:

```shell
node tests/remote-test.js
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


### Release History remote

- v1.0.2 - Updated webfont file network location 
- v1.0.1 - Fixed uglifier bug
- v1.0.0 - Updated dependencies, moved to env vars
- v0.2.5 - Updated dependencies
- v0.2.4 - Updated dependencies
- v0.2.3 - Updated dependencies
- v0.2.2 - Updated dependencies
- v0.2.1 - Updated index page background color (GUI’s body @color-Background mapping removed)
- v0.2.0 - Updated dependencies and Grunticon cssprefix
- v0.1.3 - Fixed silly SVG brand bug
- v0.1.2 - Fixed build when only SVG was selected
- v0.1.1 - Added includeSVG option, refreshed dependencies in blend package
- v0.1.0 - Improved test, fixed unavailable brands in index, added webfont link and priority system
- v0.0.4 - Added stress test
- v0.0.3 - Added dynamic branding
- v0.0.2 - Added grunt build to download
- v0.0.1 - Initial file server system setup

**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


### License

Copyright (c) Westpac 2019. Licensed under the [GNU GPLv2](https://raw.githubusercontent.com/WestpacCXTeam/blender/master/LICENSE).

**[⬆ back to top](#content)**

# };
