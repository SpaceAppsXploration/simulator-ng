simulator-ng
===========

## What's that?

This a POC app for Chronos Project Platform.

This is a Python3 [Tornado](https://github.com/tornadoweb/tornado) Web-server to run [sockjs](https://github.com/sockjs/sockjs-client) with [sockjs-tornado](https://github.com/mrjoes/sockjs-tornado).<br/>
The data is fetched from [Chronos cloudService](https://github.com/SpaceAppsXploration/cloudService) at [http://spacexplore.it](http://www.spacexplore.it).<br/>
The app is the Angular-js one in /static/app.

## To Do

*Implement loader<br/>
*Implement promises <br/>
*Write uilities' functions to handle controllers' common tasks <br/>
*Fix the pages navigation system (pages should keep selections) <br/>
*Move DOM manipulation from controllers to directives<br/>
*Implement [JSON-RPC](http://en.wikipedia.org/wiki/JSON-RPC)

Notes: $routeProvider > resolve can be found in $route.current.locals<br/>
Use $scope.bind('<mouseevent>') in directives to trigger events


## Installation


You need `npm` and `bower` to install client-side libraries and tests, and `angularjs` itself.

To run the server locally:

* Create a virtual environment: `pyvenv-3.3 {/path/to/your/venv}`

* Activate your venv: `source {/path/to/your/venv}/bin/activate`

* Install dependencies into the venv: 

        easy_install pip
        pip tornado
        pip sockjs-tornado

* Clone repository: `git clone https://github.com/SpaceAppsXploration/simulator-ng`

        cd simulator-ng/static
        npm install
        bower install

* Start local server, in simulator-ng directory:

        nohup python3.3 astroloop.py &

Check if working: go to [localhost:8080](http://localhost:8080) in your browser
