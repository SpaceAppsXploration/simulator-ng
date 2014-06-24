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
        .controller('establishSocket', ['$rootScope', '$scope', 'socketService', 'Designing', function ($rootScope, $scope, socketService, Design) {
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

            $scope.Model = Design; // init the Model object
            $scope.Page = {};
		}])
		.controller('Start', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
            /**
            * ## controller for 01-Destination
            * User chooses destination
            * define the choose destination method
            * define events listeners
            */

            var Model = $scope.Model;

            $rootScope.$watch('Socket.open', function(value){ // watch opening and trigger for init data
                if (value == true) {
                    console.log('Socket.open: ', value);
                    $scope.Socket.open = true;
                    if (typeof $scope.Page.physics == 'undefined') $rootScope.toServer("get_physics", ""); // ask for physical data about destinations
                    if (typeof $scope.Page.targets == 'undefined') $rootScope.toServer("get_target", ""); // ask for all the destinations
                } else return;
            });

            $scope.chooseT = function(obj) { // method fired by clicking on a destination name in template
                $scope.safeApply(function(){ $scope.Page.highlight = obj; });
                console.log($scope.Page.highlight);

            };

            $scope.setDestination = function(){
                Model.destination = $scope.Page.highlight; // ng-click scope var to rootScope
                if (Model.mission != null) Model.mission = null;
                $scope.safeApply(function() { $location.path('/mission') });
            };

            // Events Listeners from socketService
            $rootScope.$on('socket', function(event, value) { // sockets opens
                //console.log(event, value);
                if (value === 1) {
                    console.log('now open, can trigger');
                }
                else console.log('now closed, cannot trigger');
            });
            $rootScope.$on('targets', function(event, values) { // receive data for all the targets
                //console.log(event, value);
                var earth = values.filter(function( obj ) {
                        return obj.slug == 'earth';
                });
                var targets = values.filter(function( obj ) {
                        return obj.use_in_sim == true;
                });

                $scope.safeApply(function(){
                    $scope.Page.highlight = earth[0];           // set the selected destination in template scope
                    //console.log($rootScope.Model);
                    $scope.Page.targets = targets;             // save the targets' data in template scope
                    //console.log($scope.Page.targets);
                });
            });
            $rootScope.$on('get_physics', function(event, value) { // save physical data
                //console.log(event, value);
                $scope.safeApply(function(){
                    $scope.Page.physics = value;
                });
            });
		}])
        .controller('Mission', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
            /**
            * ## controller for 02-Mission
            * User decides mission's goal
            * define the choose destination method
            * define events listeners
            */

            var Model = $scope.Model;
            console.log(Model);
            var paramsTemp = null;

            if(typeof Model == 'undefined' || Model.destination == null) return $location.path('/start');

            $scope.Page.goals = goals; // load goals data from goals.js

            $scope.chooseG = function(obj) { // method fired by clicking on choose for mission goal
                Model.mission = obj;
                var destination = Model.destination.slug;
                var goal = Model.mission.slug;
                paramsTemp = "?destination="+destination+"&mission="+goal;
                $rootScope.toServer("destination-mission", paramsTemp); // ask to server if goal-destination combo is good
                console.log(Model);
            };
            //console.log($scope.Page.goals);

            $rootScope.$on('destination-mission', function(event, value){
                console.log(value);
                if (value.code == 1) {
                    console.log('Error');
                    var error = value.message+': '+value.content;
                    Model.setError(error);
                    Model.setMission(null);
                    paramsTemp = null;
                    return alert(error);
                } else {
                    console.log('Redirect');
                    Model.setError(null);
                    Model.setParams(paramsTemp);
                    $scope.$apply(function(){$location.path('/payloads');});
                }

            });
		}])
        .controller('Payloads', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
            /**
            * ## controller for 03-Payloads
            * User decides payloads
            * define the choose destination method
            * define events listeners
            */

            var Model = $scope.Model;
            $scope.Page.checkboxesPL = {}; // checkboxes form bind model

            $scope.safeApply(function(){ $scope.Model.payloads = [] });
            var payloads = $scope.Model.payloads;

            var params = $scope.Model.printParams();
            var paramsTemp;

			if(typeof Model == 'undefined' || Model.destination == null) return $location.path('/start');
            else if(Model.mission == null) return $location.path('/mission');

            if (typeof $scope.Page.comps == 'undefined') $rootScope.toServer("get_comps", ""); // ask for physical data about destinations
            if (typeof $scope.Page.comps_types == 'undefined') $rootScope.toServer("get_comps_types", ""); // ask for all the destinations

            $scope.togglePayload = function(obj){
                console.log($scope.Page.checkboxesPL);
                console.log(obj);
                var slug = obj.slug;
                if($.inArray(slug, payloads) == -1) {
                    $scope.safeApply(function(){ Model.addPayload(slug); });
                }
                else {
                    $scope.safeApply(function(){ Model.removePayload(slug); });
                }
                console.log(payloads);
            };

            $scope.setPayloads = function(){
                if(payloads.length == 0) return alert("Want to waste some fuel?");
                var check = '';
                for (var i = 0; i < payloads.length;i++) {
                    check += '&'+payloads[i]+'=true'
                }
                paramsTemp = params+check;
                console.log(paramsTemp);
                $rootScope.toServer("destination-mission", paramsTemp); // ask to server if goal-destination combo is good
            };

            $rootScope.$on('destination-mission', function(event, value){
                console.log(value);
                if (value.code == 1) {
                    console.log('Error');
                    var error = value.message+': '+value.content;
                    Model.setError(error);
                    paramsTemp = null;
                    return alert(error);
                } else {
                    console.log('Redirect');
                    Model.setError(null);
                    Model.setParams(paramsTemp);
                    $scope.$apply(function(){$location.path('/bus');});
                }

            });
            $rootScope.$on('get_comps', function(event, values){
                var comps = values.filter(function( obj ) {
                        return obj.category == 'payload';
                });
                $scope.safeApply(function(){
                    $scope.Page.comps = comps;           // set the comps obj in the Page
                    console.log($scope.Page.comps);
                });
            });
            $rootScope.$on('get_comps_types', function(event, value){
                $scope.safeApply(function(){
                    $scope.Page.comps_types = value;           // set the comps obj in the Page
                    //console.log($rootScope.Model);
                });

            });



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