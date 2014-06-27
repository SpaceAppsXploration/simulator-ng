/**!
*
* Services
* Global Values and Factories
*
* Copyright(c) 2014 Lorenzo <tunedconsulting@gmail.com>
* MIT Licensed
*
*/

define(['angular'], function (angular) {
	'use strict';
	
  // Register Services
  // value service or factory
	angular.module('myApp.services', [])
        .value('version', '0.1')
        .factory('Designing', [ function(){
            var factory; // Simulator model object

            factory = {
                "destination": null,
                "mission": null,
                "payloads": null,
                "bus": null,
                "params": null,
                "simError": null
            };

            factory.setDestination = function(target){
                this.destination = target
                return false
            };

            factory.getDestination = function(){
                return this.destination
            };

            factory.setMission = function(mission){
                this.mission = mission;
                return false
            };

            factory.getMission = function(){
                return this.mission
            };

            factory.addPayload = function(name){
                var payloads = this.payloads;
                payloads.push(name);
                return false
            };

            factory.removePayload = function(name){
                var payloads = this.payloads;
                var index = $.inArray(name, payloads);
                if (index > -1) {
                    payloads.splice(index, 1);
                }
            };

            factory.getPayloads = function(){
                return this.payloads
            };

            factory.addBus = function(name){
                this.bus.push(name);
                return false
            };

            factory.removeBus = function(name){
                var bus = this.bus;
                var index = jQuery.inArray(name, bus);
                if (index > -1) {
                    bus.splice(index, 1);
                }
                return false
            };

            factory.getBus = function(){
                return this.bus
            };

            factory.check = function() {
                return {
                    "destination": this.destination,
                    "mission": this.mission,
                    "bus": this.bus,
                    "payload": this.payload
                }
            };

            factory.printParams = function() {
                return this.params
            };

            factory.setParams = function(params){
                this.params = params
            };

            factory.getError = function(){
                return this.simError
            };

            factory.setError = function(error){
                this.SimError = error;
                return false
            };

            factory.printError = function(error){
                return alert(error);
            };

            return  factory
        }])
        .factory('socketService', ['$rootScope', '$log', function($rootScope, $log){
            var createSocket = function(){

                // Get reference to port.
                var port = (location.port != 80) ? ':' + location.port : '';
                var connectTimeStamps = [];

                var socket = new SockJS('//' + document.domain + '' + port + '/connect', null,
                    { 'debug':true, 'devel' : true,
                        'protocols_whitelist': ['xdr-streaming',
                            'xdr-polling',
                            'xhr-streaming',
                            'iframe-eventsource',
                            'iframe-htmlfile',
                            'xhr-polling',
                            'websocket' ]
                    }
                );

                /**
                * ## Data interaction hooks
                *
                * Passes off core SockJS data interaction hooks to rest of application so
                * callbacks can be cleanly defined externally for each event.
                */
                socket.onopen = function(){
                    // rootScope emits opening of socket for controllers
                    $rootScope.$emit('socket', 1);
                    $rootScope.$apply(function() {
                        $rootScope.Socket.open = true;
                    });
                    //service.open = true;
                    connectTimeStamps.push( new Date().getTime() );
                    var args = arguments;

                    service.timesOpened++;
                    // Attempted to connect. Note timestamp.
                    //service.send({"query": "test", "object": '123124'});

                    if(service.handlers.onopen ){
                        $rootScope.$apply(function() {
                            service.handlers.onopen.apply( socket, args )
                        })
                    }
                };

                socket.onmessage = function(data){

                    var args = arguments;
                    var response = JSON.parse(data.data);
                    //console.log(response)
                    try{
                        args[0].data = JSON.parse(args[0].data);
                    } catch(e){
                    // there should be a better way to do this
                    // but it is fast
                    }

                    if (response.data_type == 'get_target') {
                        if (response.data.length > 1) {
                            //show targets infos
                            $rootScope.$emit('targets', response.data);
                        }
                    } else {
                        $rootScope.$emit(response.data_type, response.data);
                    }

                    if( service.handlers.onmessage ){
                        $rootScope.$apply(
                            function(){
                                service.handlers.onmessage.apply(socket, args);
                            }
                        )
                    }
                };

                socket.onclose = function(){
                    $rootScope.$emit('socket', 0);
                    service.open = false;
                    console.log('STATUS: OPEN: ' + service.open + ' ' + connectTimeStamps);
                    setTimeout( function(){ socket = createSocket(service); } , 3000 );
                    var args = arguments;

                    if( service.handlers.onclose ){
                        $rootScope.$apply(
                            function(){
                            service.handlers.onclose.apply(socket,args);
                        }
                        )
                    }
                };

            return socket;
            };

            var service =
                { handlers : {},
                    onopen: function( callback ){
                        this.handlers.onopen = callback;
                    },
                    onmessage: function( callback ){
                        console.log('here goes the callback')
                        this.handlers.onmessage = callback;
                    },
                    onclose: function( callback ){
                        this.handlers.onclose = callback;
                    },
                    send: function( data ){
                        var msg = typeof(data) == "object" ? JSON.stringify(data) : data;
                        //console.log(msg)
                        var status = socket.send(msg);
                    },
                    open: false
                };

            var socket = createSocket();
            return service;
        }])
        .service('myService', function($http, $q) {
            var _this = this;

            this.promiseToHaveData = function() {
                var defer = $q.defer();

                $http.get('someFile.json')
                    .success(function(data) {
                        angular.extend(_this, data);
                        defer.resolve();
                    })
                    .error(function() {
                        defer.reject('could not find someFile.json');
                    });

                return defer.promise;
            }
        });
});
