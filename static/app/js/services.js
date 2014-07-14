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
        .provider('socketFactory', function () {

            // when forwarding events, prefix the event name
            var ioSocket;

            // expose to provider
            this.$get = function ($timeout) {

                var asyncAngularify = function (socket, callback) {
                    return callback ? function () {
                        var args = arguments;
                        $timeout(function () {
                            callback.apply(socket, args);
                        }, 0);
                    } : angular.noop;
                };

                return function socketFactory(options) {
                    options = options || {};
                    var socket = options.socket || new SockJS(options.url);

                    var wrappedSocket = {
                        status: false,
                        callbacks: {},
                        setHandler: function (event, callback) {
                            socket['on' + event] = asyncAngularify(socket, callback);
                            return this;
                        },
                        removeHandler: function (event) {
                            delete socket['on' + event];
                            return this;
                        },
                        send: function () {
                            return socket.send.apply(socket, arguments);
                        },
                        close: function () {
                            return socket.close.apply(socket, arguments);
                        }
                    };

                    return wrappedSocket;
                };
            };
        })
        .service('getDBscience', function($http, $q) {
            var _this = this; // data get passed directly in the service obj

            this.promiseToHaveData = function() {
                var defer = $q.defer();

                $http.get('/database')
                    .success(function(data) {
                        angular.extend(_this, data);
                        defer.resolve();
                    })
                    .error(function() {
                        defer.reject('Error in request');
                    });

                return defer.promise;
            }
        });
});
