/**!
*
* Controllers
* Templates Logic
*
* Copyright(c) 2014 Lorenzo <tunedconsulting@gmail.com>
* MIT Licensed
*
*/

define(['angular', 'services'], function (angular) {
	'use strict';

	return angular.module('myApp.controllers', ['myApp.services'])
		// controllers where Services are being used
        .controller('establishSocket', ['$rootScope', '$scope', 'socketService', function ($rootScope, $scope, socketService) {
            /**
            * ## socketService prepares to open socket
            * controller for <body> (extends to all templates)
            */

            $rootScope.Socket = {}; // socket status object

            var toServer = function(query, obj){ // utility to call a send to the server
                return socketService.send({"query": query, "object": obj });
            };
            $rootScope.toServer = toServer;

            $rootScope.safeApply = function(fn) { // utility to safe apply for avoiding $digest errors
                var phase = this.$root.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                      fn();
                    }
                } else {
                this.$apply(fn);
                }
            };
		}])
		.controller('Start', ['$scope', '$rootScope', 'Designing', 'socketService', function ($scope, $rootScope, Designing, socketService) {
            // controller for 01-Destination
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

                $scope.$apply(function(){
                    $scope.Page.selected = earth[0];           // set the selected destination in template scope
                    //console.log($rootScope.Model.destination);
                    $scope.Page.targets = targets;             // save the targets' data in template scope
                    //console.log($scope.Page.targets);
                });
            });
            $rootScope.$on('physics', function(event, value) { // save physical data
                //console.log(event, value);
                $scope.Page.physics = value;
                $scope.$apply();
            });
		}])
        .controller('Mission', ['$scope', 'version', function ($scope, version) {
			$scope.scopedAppVersion = version;
		}])
        .controller('Payloads', ['$scope', 'version', function ($scope, version) {
			$scope.scopedAppVersion = version;
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