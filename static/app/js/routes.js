/**!
*
* Routes
* Routing
*
* Copyright(c) 2014 Lorenzo <tunedconsulting@gmail.com>
* MIT Licensed
*
*/

define(['angular', 'app'], function(angular, app) {
	'use strict';

	return app
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/start', {
                templateUrl: '/static/app/partials/01-targeting.html',
                controller: 'Start'
            });
            $routeProvider.when('/design', {
                templateUrl: '/static/app/partials/02-ship.html',
                controller: 'Payloads'
            });
            $routeProvider.when('/bus', {
                templateUrl: '/static/app/partials/04-bus.html',
                controller: 'Bus'
            });
            $routeProvider.when('/results', {
                templateUrl: '/static/app/partials/05-results.html',
                controller: 'Results'
            });
            $routeProvider.when('/tutorial', {
                templateUrl: '/static/app/partials/tutorial.html'
            });
            $routeProvider.when('/feedback', {
                templateUrl: '/static/app/partials/feedback.html',
                controller: 'Feedback'
            });
            $routeProvider.when('/sandbox', {
                templateUrl: '/static/app/partials/processing.html',
                controller: 'Sandbox'
            });
            /*$routeProvider.when('/database', {
                templateUrl: '/static/app/partials/database.html',
                controller: 'Database',
                resolve: {
                    initializeData: function ($q, $timeout, getDBscience) {
                        return getDBscience.promiseToHaveData();
                    }
                }
            });*/
            $routeProvider.otherwise({redirectTo: '/start'});
	    }]); /** end of routing **/

});