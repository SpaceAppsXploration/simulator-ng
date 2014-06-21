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
        .controller('establishSocket', ['$scope', 'socketService', function ($scope, socketService) {
            // socketService creates socket
            $scope.sock_open = true;
            console.log('STATUS: ' + $scope.sock_open);
            var toServer = function(query, obj){
                return socketService.send({"query": query, "object": obj });
            };
            $scope.toServer = toServer
		}])
		.controller('Start', ['$scope', '$rootScope', 'Designing', 'socketService', function ($scope, $rootScope, Designing, socketService) {
            $rootScope.Model = Designing;
            $scope.Page = {};

            $scope.retrieveT = function(obj) {
                $rootScope.Model.destination = obj;
                $scope.Page.selected = obj;

                //console.log($rootScope.Model.destination);
                //console.log($scope.Page.selected);

            };

            // controller waits for socket to open in rootScope
            $rootScope.$on('socket', function(event, value) {
                //console.log(event, value);
                if (value === 1) {
                    socketService.send({"query": "get_physics", "object": ""});
                    socketService.send({"query": "get_target", "object": ""});
                }
                else console.log('now closed, cannot trigger');
            });
            $rootScope.$on('target', function(event, value) {
                //console.log(event, value);
                $rootScope.Model.setDestination(value);

                $rootScope.$apply();
            });
            $rootScope.$on('targets', function(event, values) {
                //console.log(event, value);
                var earth = values.filter(function( obj ) {
                        return obj.slug == 'earth';
                });
                var targets = values.filter(function( obj ) {
                        return obj.use_in_sim == true;
                });
                $rootScope.Model.setDestination(earth[0]);
                $scope.Page.selected = earth[0];
                console.log($rootScope.Model.destination);
                $scope.Page.targets = targets;
                console.log($scope.Page.targets);
                $scope.$apply();
            });
            $rootScope.$on('physics', function(event, value) {
                console.log(event, value);
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