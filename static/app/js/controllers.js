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

            var Model = $scope.$parent.Model;

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
                console.log(event, value);
                $scope.safeApply(function(){
                    $scope.Page.physics = value;
                });
            });
		}])
        .controller('Mission', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
            /**
            * ## controller for 02-Mission
            * User decides mission's goal
            * define the choose mission method
            * define events listeners
            */

            var Model = $scope.$parent.Model;
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
                    $location.path('/payloads');
                    return $scope.$apply();
                }

            });
		}])
        .controller('Payloads', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
            /**
            * ## controller for 03-Payloads
            * User decides payloads
            * define the setPayloads method
            * define events listeners
            */

            var Model = $scope.$parent.Model;
            $scope.Page.checkboxesPL = {}; // checkboxes form bind model

            $scope.safeApply(function(){ $scope.Model.payloads = [] });
            var payloads = $scope.Model.payloads;

            var params = $scope.Model.printParams();
            var paramsTemp;

			if(typeof Model == 'undefined' || Model.destination == null) return $location.path('/start');
            else if(Model.mission == null) return $location.path('/mission');

            if (typeof $scope.Page.pl == 'undefined') $rootScope.toServer("get_comps", ""); // ask for payloads data
            if (typeof $scope.pl_types == 'undefined') $rootScope.toServer("get_comps_types", ""); // ask for payloads types

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
                    $location.path('/bus');
                    return $scope.$apply();
                }

            });

            $rootScope.$on('get_comps', function(event, values){
                var pl = values.filter(function( obj ) {
                        return obj.category == 'payload';
                });
                var bs = values.filter(function( obj ) {
                        return obj.category == 'bus';
                });

                console.log(pl)

                function toObject(arr) {
                    var rv = {};
                    for (var i = 0; i < arr.length; i++) {
                        var el = arr[i];
                        rv[el.slug] = arr[i];
                    }
                    return rv;
                }

                $scope.$parent.PAYLOADS = toObject(pl); // set the general payloads obj by slug
                $scope.$parent.BUS = toObject(bs); // set the general bus obj by slug

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
                });
            });
            $rootScope.$on('get_comps_types', function(event, values){
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
        .controller('Bus', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
            /**
            * ## controller for 04-Bus
            * User decides bus
            * define the setBus method
            * define events listeners
            */

            var Model = $scope.$parent.Model;


            $scope.safeApply(function(){ $scope.Model.bus = [] });
            var bus = $scope.Model.bus;

            var params = $scope.Model.printParams();
            var paramsTemp;

			if(typeof Model == 'undefined' || Model.destination == null) return $location.path('/start');
            else if(Model.mission == null) return $location.path('/mission');
            else if(Model.payloads == null) return $location.path('/payloads');

            if (typeof $scope.Page.bus== 'undefined') $rootScope.toServer("get_comps", ""); // ask for bus data
            if (typeof $scope.Page.bs_types == 'undefined') $rootScope.toServer("get_comps_types", ""); // ask for bus types

            var restBUS = $scope.Page.bus;
            var initCheckBoxes = function(){
                var obj = {};
                for(var i = 0; i < restBUS.length; i++){
                    obj[i] = {0: false, 1: false}
                }
                return obj
            }; // checkboxes form bind model
            $scope.Page.checkboxesBUS = initCheckBoxes();

            $scope.toggleBUS = function(obj, el){
                var model = $scope.Page.checkboxesBUS;
                console.log(model)
                for (var i in model){
                    if(model[i][0] == true) {
                        var id = i+[0];
                        console.log($('#'+id).parent().parent().parent().next().find('input[type="checkbox"]'));
                        $('#'+id).parent().parent().parent().next().find('input[type="checkbox"]').prop('disabled', true);
                    } else {
                        var id = i+[0];
                        $('#'+id).parent().parent().parent().next().find('input[type="checkbox"]').prop('disabled', false);
                    }
                    if(model[i][1] == true) {
                        var id = i+[1];
                        console.log($('#'+id).parent().parent().parent().prev().find('input[type="checkbox"]'));
                        $('#'+id).parent().parent().parent().prev().find('input[type="checkbox"]').prop('disabled', true);
                    } else {
                        var id = i+[1];
                       $('#'+id).parent().parent().parent().prev().find('input[type="checkbox"]').prop('disabled', false);
                    }

                }

                var slug = obj.slug;
                if($.inArray(slug, bus) == -1) {
                    $scope.safeApply(function(){ Model.addBus(slug); });
                }
                else {
                    $scope.safeApply(function(){ Model.removeBus(slug); });
                }
                console.log(bus);

            };

            $scope.setBus = function(){
                if(bus.length == 0) return alert("Payloads cannot fly into a bubble...");
                var check = '';
                for (var i = 0; i < bus.length;i++) {
                    check += '&'+bus[i]+'=bustrue'
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
                    $location.path('/results');
                    return $scope.$apply();
                }

            });

            $rootScope.$on('get_comps', function(event, values){
                var pl = values.filter(function( obj ) {
                        return obj.category == 'payload';
                });
                var bs = values.filter(function( obj ) {
                        return obj.category == 'bus';
                });
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
                $scope.safeApply(function(){
                    $scope.Page.pl = pl;          // set the payload
                    $scope.Page.bus = bs;          // set the bus obj in the Page
                });
            });
            $rootScope.$on('get_comps_types', function(event, values){
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
        .controller('Results', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
			var totals = new Array()

            var payloads = $scope.Model.getPayloads();
            var bus = $scope.Model.getBus();

            totals[0] = $scope.Model.getDestination().slug;
            totals[1] = $scope.Model.getMission().slug;
            totals[2] = payloads;
            totals[3] = bus;

            var target = $scope.Model.getDestination().id;
            console.log(totals)
            console.log(target)

            $rootScope.toServer("get_ratings", totals);

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

             console.log(comps);
            $rootScope.toServer("get_sci_data", {"target": target, "comps": comps});

            $rootScope.$on('get_ratings', function(event, values){
              var data = values;
              var rates = JsonHuman.format(data);
              $('#ratings').append('<div id="t-ratings" class="table-responsive"></div>');
              $('#t-ratings').append(rates);
            });

            $rootScope.$on('get_sci_data', function(event, values){
              var data = values;
              console.log(data)

              function collect(data){
                var missions = '';
                var data = data;
                for (var i = 0; i < data.length ; i++) {
                  var header = data[i].header;
                    header = header.replace(/^(.{41}[^\s]*).*/);
                  var image;
                  if(data[i].mission != null) image = data[i].mission.image_url;
                    else image = 'http://placehold.it/80x80';
                  missions += '<div class="list-group"> \
                              <div class="list-group-item"> \
                                  <div class="media col-md-3"> \
                                      <figure class="pull-left"> \
                                          <img class="media-object img-rounded img-responsive"  src="'+image+'" alt="" style="width=auto; height:80px;" > \
                                      </figure> \
                                  </div> \
                                  <div class="col-md-6"> \
                                      <h4 class="list-group-item-heading">'+header+'...</h4> \
                                      <p class="">  \
                                          <a target="_blank" href="'+data[i].body+'"> Website</a>  \
                                      </p> \
                                      <p> \
                                          <a onclick="#">See Details</a> \
                                      </p> \
                                  </div> \
                              </div> \
                          </div>';
                }
                return missions
              }
              var missions = collect(data)
              $('#similars').append(missions);
            });

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