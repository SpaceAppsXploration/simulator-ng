/**!
*
* Controllers
* Templates Logic
*
* Copyright(c) 2014 Lorenzo <tunedconsulting@gmail.com>
* MIT Licensed
*
*/

define(['angular', 'services', 'utils', 'goals'], function (angular) {
	'use strict';

	return angular.module('myApp.controllers', ['myApp.services'])
		// controllers where Services are being used
        .controller('establishSocket', ['$rootScope', '$scope', 'socketService', function ($rootScope, $scope, socketService) {
            /**
            * ## controller for <body> (extends to all templates)
            * socketService prepares to open socket
            */

            $rootScope.Socket = {}; // socket status object

            var toServer = function(query, obj){ // utility to call a send to the server (SockJS emitter)
                return socketService.send({"query": query, "object": obj });
            };
            $rootScope.toServer = toServer;

            $rootScope.safeApply = safeApply; // load safeApply() from utils.js
		}])
		.controller('Start', ['$scope', '$rootScope', 'Designing', function ($scope, $rootScope, Designing) {
            /**
            * ## controller for 01-Destination
            * set Model and Page objects
            * define the choose destination method
            * define events listeners
            */

            $rootScope.Model = Designing;
            $scope.Page = {};

            $rootScope.$watch('Socket.open', function(value){ // watch opening and trigger for init data
                if (value == true) {
                    console.log('Socket.open: ', value);
                    $rootScope.toServer("get_physics", ""); // ask for physical data about destinations
                    $rootScope.toServer("get_target", ""); // ask for all the destinations
                } else return;
            });

            $scope.chooseT = function(obj) { // method fired by clicking on a destination name in template
                $rootScope.Model.destination = obj;
                $scope.Page.selected = obj;
                console.log($rootScope.Model);

            };

            // Events Listeners from socketService
            $rootScope.$on('socket', function(event, value) { // sockets opens
                //console.log(event, value);
                if (value === 1) {
                    console.log('now open, can trigger');
                }
                else console.log('now closed, cannot trigger');
            });
            $rootScope.$on('target', function(event, value) { // receive data for a single target
                //console.log(event, value);
                $rootScope.$safeApply(function() {
                    $rootScope.Model.setDestination(value); // set the choosen destination in the model
                });
            });
            $rootScope.$on('targets', function(event, values) { // receive data for all the targets
                //console.log(event, value);
                var earth = values.filter(function( obj ) {
                        return obj.slug == 'earth';
                });
                var targets = values.filter(function( obj ) {
                        return obj.use_in_sim == true;
                });
                $rootScope.Model.setDestination(earth[0]); // set initial value to 'earth' object

                $rootScope.safeApply(function(){
                    $scope.Page.selected = earth[0];           // set the selected destination in template scope
                    //console.log($rootScope.Model);
                    $scope.Page.targets = targets;             // save the targets' data in template scope
                    //console.log($scope.Page.targets);
                });
            });
            $rootScope.$on('physics', function(event, value) { // save physical data
                //console.log(event, value);
                $rootScope.safeApply(function(){
                    $scope.Page.physics = value;
                });
            });
		}])
        .controller('Mission', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
            if(typeof $rootScope.Model == 'undefined' || $rootScope.Model.destination == null) return $location.path('/start');

            $scope.Page = {};
            $scope.Page.goals = goals; // load goals data from goals.js
            $('#selected').html('').html('<div class="row"><img class="img-rounded img-mini" src="'+ $rootScope.Model.destination.image_url +'"/><span class="text">'+ $rootScope.Model.destination.name +'</span></div>');

            $scope.chooseG = function(obj) { // method fired by clicking on choose for mission goal
                $rootScope.Model.mission = obj;
                var destination = $rootScope.Model.destination.slug;
                var goal = $rootScope.Model.mission.slug;
                $rootScope.toServer("destination-mission", "?destination="+destination+"&mission="+goal); // ask to server if goal-destination combo is good
                console.log($rootScope.Model);
            };
			console.log($rootScope.Model.destination);
            console.log($scope.Page.goals);

            $rootScope.$on('destination-mission', function(event, value){
                console.log(value);
                if (value.code == 1) {
                    console.log('Error');
                    var error = value.message+': '+value.content;
                    $rootScope.Model.setError(error);
                    $rootScope.Model.setMission(null);
                    return alert(error);
                } else {
                    console.log('Redirect');
                    $rootScope.Model.setError(null);
                    $rootScope.$apply(function(){$location.path('/payloads');});
                }

            });
		}])
        .controller('Payloads', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
			if(typeof $rootScope.Model == 'undefined' || $rootScope.Model.destination == null) return $location.path('/start');
            else if($rootScope.Model.mission == null) return $location.path('/mission');
            $('#selected').append('<div class="row"><img class="img-rounded img-mini" src="'+ $rootScope.Model.mission.image_url +'"/><span class="text">'+ $rootScope.Model.mission.name +'</span></div>')
		}])
        .controller('Bus', ['$scope', 'version', function ($scope, version) {
			$scope.scopedAppVersion = version;
		}])
        .controller('Results', ['$scope', 'version', function ($scope, version) {
			$scope.scopedAppVersion = version;
		}])
		// More involved example where controller is required from an external file
		.controller('MyCtrl2', ['$scope', '$injector', function($scope, $injector) {
			require(['controllers/myctrl2'], function(myctrl2) {
				// injector method takes an array of modules as the first argument
				// if you want your controller to be able to use components from
				// any of your other modules, make sure you include it together with 'ng'
				// Furthermore we need to pass on the $scope as it's unique to this controller
				$injector.invoke(myctrl2, this, {'$scope': $scope});
			});
		}]);
});