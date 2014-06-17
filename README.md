simulator
=========


## Installation

py3.3-tornado server

This is a Python3 [Tornado](https://github.com/tornadoweb/tornado) Web Server to run [sockjs](https://github.com/sockjs/sockjs-client) with [sockjs-tornado](https://github.com/mrjoes/sockjs-tornado)

You need `npm` and `bower` to install client-side libraries and tests, and `angularjs` itself.

To run the server locally:

Create a virtual environment: `pyvenv-3.3 {/path/to/your/venv}`

Activate your venv: `source {/path/to/your/venv}/bin/activate`

Install dependencies into the venv: 

    easy_install pip
    pip tornado
    pip sockjs-tornado

Clone repository: `git clone https://github.com/SpaceAppsXploration/simulator-ng`

    cd simulator-ng/static
    npm install
    bower install

Start local server, in simulator-ng directory:

    python3.3 astroloop.py

Check if working: go to [localhost:8080](http://localhost:8080) in your browser
