define([
	'angular',
	'filters',
	'services',
	'directives',
	'controllers',
	'angularRoute'
	], function (angular, filters, services, directives, controllers) {
		'use strict';

		// Declare app level module which depends on filters, and services
		
		return angular.module('myApp', [
			'ngRoute',
			'myApp.controllers',
			'myApp.filters',
			'myApp.services',
			'myApp.directives'
		])
        .factory('mySocket', function (socketFactory) {
             var port = (location.port != 80) ? ':' + location.port : '';
             return socketFactory({
                 "url": "//" + document.domain + "" + port + "/connect",
                 "debug":true,
                 "devel" : true,
                 "protocols_whitelist": ['xdr-streaming',
                            'xdr-polling',
                            'xhr-streaming',
                            'iframe-eventsource',
                            'iframe-htmlfile',
                            'xhr-polling',
                            'websocket' ]
             });
        })
        /*.config(function($locationProvider) {
            $locationProvider.html5Mode(true);
        })*/;
});
