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
        .controller('establishSocket', ['$scope', '$location', 'mySocket', 'Designing', '$window', function ($scope, $location, mySocket, Designing, $window) {
            /**
            * ## controller for <body> (extends to all templates)
            * socketService prepares to open socket
            */

            mySocket.setHandler('open', function() {  /* define handler for 'open' socket action */
                mySocket.status = true;
                $scope.$broadcast('socket', true);
                console.log('STATUS: OPEN: ' + true);
            });

            mySocket.setHandler('close', function() { /* define handler for 'close' socket action */
                $scope.$broadcast('socket', false);
                console.log('STATUS: OPEN: ' + false);
            });

            mySocket.setHandler('message', function(response) { /* define handler for 'message' socket action */
                var response = JSON.parse(response.data);
                if (response.data_type == 'get_target') {
                    if (response.data.length > 1) {
                        //show targets infos
                        $scope.$broadcast('targets', response.data);
                    }
                } else {
                    $scope.$broadcast(response.data_type, response.data);
                }
            });

            var toServer = function(query, obj){ /* utility to call a send to the server (SockJS emitter) */
                return mySocket.send(JSON.stringify({"query": query, "object": obj }));
            };
            $scope.toServer = toServer;

            $scope.safeApply = safeApply; /* load safeApply() from utils.js */

            $scope.reset = function() {  /* to reset inputs */
                $scope.Model = Designing;
                $scope.simError = '';
                $window.location.href = '/';
                $window.location.reload();
                $scope.safeApply();
            };

            $scope.Socket = mySocket;
            $scope.Model = Designing; /* init the Model object */
            $scope.Page = {};

            console.log($scope.Socket);
		}])
		.controller('Start', ['$scope', '$location', function ($scope, $location) {
            /**
            * ## controller for 01-Destination
            * User chooses destination
            * define the choose destination method
            * define events listeners
            */

            var Model = $scope.$parent.Model;
            $scope.Page.goals = goals; /* load goals data from goals.js */
            var paramsTemp = null;
            $scope.Page.selection = false;
            $scope.Page.destcolor = null;

            $scope.$watch('Socket.status', function(value){ /* watch opening and trigger for init data */
                if (value == true) {
                    console.log('Socket.open: ', value);
                    if (typeof $scope.Page.physics == 'undefined') $scope.toServer("get_physics", ""); /* ask for physical data about destinations */
                    if (typeof $scope.Page.targets == 'undefined') $scope.toServer("get_target", ""); /* ask for all the destinations */
                } else return;
            });

            $scope.setDestination = function(){  /* method fired when clicking on a destination's name */
                Model.destination = $scope.Page.highlight;
                if (Model.mission != null) Model.mission = null;
                //console.log(Model.getDestination())
            };

            $scope.chooseG = function(obj) { /* method fired by clicking on a mission goal */
                if (Model.destination != null) {
                    Model.mission = obj;
                    var destination = Model.destination.slug;
                    var goal = Model.mission.slug;
                    paramsTemp = "?destination="+destination+"&mission="+goal;
                    $scope.toServer("destination-mission", paramsTemp); /* ask to server if goal-destination combo is good */
                    //console.log(Model);
                }
                else {
                    $scope.safeApply(function() {
                        $scope.simError = 'need to set a destination first';
                        Model.mission = null;
                    });
                }
            };

            $scope.resetError = function(){
                  $scope.simError = '';
            };

            /********** Events Listeners for mySocket handlers $broadcasting *************/
            $scope.$on('socket', function(event, value) { /* sockets opens */
                //console.log(event, value);
                if (value === true) {
                    console.log('now open, can trigger');
                }
                else console.log('now closed, cannot trigger');
            });
            $scope.$on('targets', function(event, values) { /* receive data for all the targets */
                console.log(event, values);
                var earth = values.filter(function( obj ) {
                        return obj.slug == 'earth';
                });
                var targets = values.filter(function( obj ) {
                        return obj.use_in_sim == true;
                });

                $scope.safeApply(function(){
                    $scope.Page.highlight = earth[0];           /* set the selected destination in template scope */
                    //console.log($scope.Model);
                    $scope.Page.targets = targets;             /* save the targets' data in template scope */
                    //console.log($scope.Page.targets);
                });
            });
            $scope.$on('get_physics', function(event, value) { /* save physical data */
                //console.log(event, value);
                $scope.safeApply(function(){
                    $scope.Page.physics = value;
                });
            });
            $scope.$on('destination-mission', function(event, value){
                //console.log(value);
                if (value.code == 1) {
                    //console.log('Error');
                    var error = value.message+': '+value.content;
                    Model.setError(error);
                    Model.setMission(null);
                    $scope.simError = error;
                    paramsTemp = null;
                    $scope.$apply();
                    //return alert(error);
                } else {
                    //console.log('Redirect');
                    Model.setError(null);
                    Model.setParams(paramsTemp);
                    $location.path('/design');
                    $scope.simError = '';
                    $scope.$apply();
                }

            });
		}])
        .controller('Payloads', ['$scope', '$location', function ($scope, $location) {
            /**
            * ## controller for 02-Design
            * User decides payloads
            * define the setPayloads method
            * define events listeners
            */

            var Model = $scope.$parent.Model;
            $scope.Model.payloads = [];
            $scope.Model.bus = [];

            $scope.Page.plslots = null;
            $scope.Page.busslots = null;

            $scope.Model.payloads = [];
            var payloads = $scope.Model.payloads;

            var paramsTemp;

            $scope.simError;

			if(typeof Model == 'undefined' || Model.destination == null) return $location.path('/start');
            else if(Model.mission == null) return $location.path('/mission');

            $scope.resetInput = function(){
                $scope.Page.plslots = {
                    1: {"status": false, "value": null, "slug": null, "element": null},
                    2: {"status": false, "value": null, "slug": null, "element": null},
                    3: {"status": false, "value": null, "slug": null, "element": null}
                }; /* the three payloads slots are void */

                $scope.Page.busslots = {
                    1: {"status": false,
                        1: {"value": null, "slug": null, "element": null},
                        2: {"value": null, "slug": null, "element": null}
                    },
                    2: {"status": false,
                        1: {"value": null, "slug": null, "element": null},
                        2: {"value": null, "slug": null, "element": null}
                    }
                }; /* the two bus slots are void */

                paramsTemp = '';
                $scope.Model.payloads = [];
                $scope.Model.bus = [];
            };

            $scope.resetInput();

            if (typeof $scope.Page.pl == 'undefined') $scope.toServer("get_comps", ""); // ask for payloads data
            if (typeof $scope.pl_types == 'undefined') $scope.toServer("get_comps_types", ""); // ask for payloads types

            $scope.resetError = function(){
                  $scope.simError = '';
            };

            $scope.togglePayload = function(obj){
                console.log(obj);
                var slug = obj.slug;
                if($.inArray(slug, payloads) == -1) {
                    $scope.safeApply(function(){ Model.addPayload(slug); });
                }
                else {
                    $scope.safeApply(function(){ Model.removePayload(slug); });
                }

                var check = '&'+slug+'=true';
                paramsTemp += check;
                                console.log(paramsTemp);
            };

            $scope.toggleBUS = function(obj, el){
                var bus = Model.getBus();
                var slug = obj.slug;
                if($.inArray(slug, bus) == -1) {
                    $scope.safeApply(function(){ Model.addBus(slug); });
                }
                else {
                    $scope.safeApply(function(){ Model.removeBus(slug); });
                }
                console.log(Model.bus);

                if (Model.getBus().length == 2) {
                    var check = '';
                    for (var i = 0; i < bus.length;i++) {
                        check += '&'+bus[i]+'=bustrue'
                    }
                    paramsTemp += check;
                    paramsTemp = Model.printParams() + paramsTemp;
                                        console.log(paramsTemp);
                    $scope.toServer("destination-mission", paramsTemp); // ask to server if goal-destination combo is good
                }

            };

            $scope.$on('destination-mission', function(event, value){
                //console.log(value);
                if (value.code == 1) {
                    //console.log('Error');
                    var error = value.message+': '+value.content;
                    Model.setError(error);
                    $scope.simError = error;
                    paramsTemp = null;
                    $scope.resetInput();
                    $scope.$apply();
                    //return alert(error);
                } else {
                    //console.log('Redirect');
                    Model.setError(null);
                    Model.setParams(paramsTemp);
                    $location.path('/results');
                    $scope.resetError();
                    $scope.$apply();
                }

            });

            $scope.$on('get_comps', function(event, values){
                var pl = values.filter(function( obj ) {
                        return obj.category == 'payload';
                });
                var bs = values.filter(function( obj ) {
                        return obj.category == 'bus';
                });

                //console.log(pl)

                function toObject(arr) {
                    var rv = {};
                    for (var i = 0; i < arr.length; i++) {
                        var el = arr[i];
                        rv[el.slug] = arr[i];
                    }
                    return rv;
                }

                $scope.$parent.PAYLOADS = toObject(pl); // set the general payloads obj
                $scope.$parent.BUS = toObject(bs); // set the general bus obj
                //console.log($scope.Page.BUS);

                var grouped = function(input, itemsPerRow) {
                      if (itemsPerRow === undefined) {
                        itemsPerRow = 1;
                      }
                      var out = [];
                      if(typeof input != 'undefined') {
                          for (var i = 0; i < input.length; i++) {
                              var rowElementIndex = i % itemsPerRow;
                              var rowIndex = (i - rowElementIndex) / itemsPerRow;
                              var row;
                              if (rowElementIndex === 0) {
                                  row = [];
                                  out[rowIndex] = row;
                              } else {
                                  row = out[rowIndex];
                              }
                              row[rowElementIndex] = input[i];
                          }
                      }
                      return out;
                };

                bs = grouped(bs, 2);
                console.log(bs);
                $scope.safeApply(function(){
                    $scope.Page.pl = pl;          // set the payload
                    $scope.Page.bus = bs;          // set the bus obj in the Page
                    $scope.resetInput()            // init pl and bus slots for data bindings
                });
            });
            $scope.$on('get_comps_types', function(event, values){
                var pl_types = values.filter(function( obj ) {
                        return obj.category == 'payload';
                });
                var bs_types = values.filter(function( obj ) {
                        return obj.category == 'bus';
                });
                $scope.safeApply(function(){
                    $scope.Page.pl_types = pl_types;           // set the comps obj in the Page
                    $scope.Page.bs_types = bs_types;           // set the comps obj in the Page
                });

            });



        }])
        .controller('Results', ['$scope', '$location', function ($scope, $location) {
            /**
            * ## controller for 03-Results
            * Results displayed
            *
            *
            */
            var Model = $scope.$parent.Model;

            if(typeof Model == 'undefined' || Model.destination == null) return $location.path('/start');
            if(Model.payloads == null || Model.payloads.length == 0) return $location.path('/design');

            $scope.Page.sci_data = {};
            $scope.Page.sci_data.loaded = false;
            $scope.Page.sci_data.value = null;

            $scope.Page.ratings = {};
            $scope.Page.ratings.loaded = false;
            $scope.Page.ratings.value = null;

            $scope.Page.missions = {};

			var totals = new Array();

            var payloads = $scope.Model.getPayloads();
            var bus = $scope.Model.getBus();

            console.log(payloads, bus);

            totals[0] = $scope.Model.getDestination().slug;
            totals[1] = $scope.Model.getMission().slug;
            totals[2] = payloads;
            totals[3] = bus;

            var target = $scope.Model.getDestination().id;
            //console.log(totals)
            //console.log(target)

            $scope.toServer("get_ratings", totals);

            var PAYLOADS = $scope.$parent.PAYLOADS;
            var BUS = $scope.$parent.BUS;



            var comps = [];
            for(var i = 0; i < payloads.length; i++) {
                var p = payloads[i];
                comps.push(PAYLOADS[p]['id'])
            }
            for(var i = 0; i < bus.length; i++) {
                var b = bus[i];
                comps.push(BUS[b]['id'])
            }

             //console.log(comps);
            $scope.toServer("get_sci_data", {"target": target, "comps": comps});

            $scope.$on('get_ratings', function(event, values){
                $scope.safeApply(function() {
                    $scope.Page.ratings.loaded = true;
                    $scope.Page.ratings.value = values;
                });

            });

            $scope.$on('get_sci_data', function(event, values){
                console.log('SCI_DATA', values);
                $scope.safeApply(function() {
                    $scope.Page.sci_data.loaded = true;
                    $scope.Page.sci_data.value = values;
                });
            });

		}])
        .controller('Sandbox', ['$scope', '$location', function ($scope, $location) {
            /**
            * ## controller for Processing Experiments
            * Display Processing scripts
            *
            */
            console.log(Processing.version);
            $scope.version = Processing.version;

            var sketchProc = function (processing) {
                // Override draw function, by default it will be called 60 times per second
                processing.draw = function() {
                  // determine center and max clock arm length
                  var centerX = processing.width / 2, centerY = processing.height / 2;
                  var maxArmLength = Math.min(centerX, centerY);

                  function drawArm(position, lengthScale, weight) {
                    processing.strokeWeight(weight);
                   processing.line(centerX, centerY,
                     centerX + Math.sin(position * 2 * Math.PI) * lengthScale * maxArmLength,
                     centerY - Math.cos(position * 2 * Math.PI) * lengthScale * maxArmLength);
                 }

                 // erase background
                 processing.background(224);

                 var now = new Date();

                 // Moving hours arm by small increments
                 var hoursPosition = (now.getHours() % 12 + now.getMinutes() / 60) / 12;
                 drawArm(hoursPosition, 0.5, 5);

                 // Moving minutes arm by small increments
                 var minutesPosition = (now.getMinutes() + now.getSeconds() / 60) / 60;
                 drawArm(minutesPosition, 0.80, 3);

                 // Moving hour arm by second increments
                 var secondsPosition = now.getSeconds() / 60;
                 drawArm(secondsPosition, 0.90, 1);
               };
             };

            var canvas = document.getElementById("canvas1");
            // attaching the sketchProc function to the canvas
            var processingInstance = new Processing(canvas, sketchProc);

        }])
        .controller('Feedback', ['$scope', '$http', function ($scope, $http) {
            /**
            * ## controller for Feedback
            * Display form
            *
            *
            */
            $scope.success = false;
            $scope.httpError = false;
            $scope.msg = {};

            $scope.send = function() {
                var obj = $scope.msg;
                console.log($scope.msg);
                $http({
                    url: '/contact',
                    method: "POST",
                    data: obj,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .success(function(data){
                        $scope.success = true;
                        $scope.msg = {};
                        console.log(data);
                    })
                    .error(function(data){
                          $scope.httpError = true;
                    });
                };

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