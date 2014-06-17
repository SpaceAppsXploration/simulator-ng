/**!
*
* Designing
* Constructor For Users Designing Choices 
*
* Copyright(c) 2014 Lorenzo <tunedconsulting@gmail.com>
* MIT Licensed
*
*/

'use strict'

var Designing = function(a, b, c, d, e, f){
  
  var destination = a;
  var mission = b;
  var payloads = c;
  var bus = d;
  var params = e;
  var simError = f;


  return {
    setDestination: function(target){
      this.destination = target
      return false
    },
    getDestination: function(){
      return this.destination
    },
    setMission: function(mission){
      this.mission = mission
      return false
    },
    getMission: function(){
      return this.mission
    },
    addPayload: function(name){
      var payloads = this.payloads 
      payloads.push(name)
      return false
    },
    removePayload: function(name){
      var payloads = this.payloads
      var index = jQuery.inArray(name, payloads)
      if (index > -1) {
        payloads.splice(index, 1);
      }
    },
    getPayloads: function(){
      return this.payloads
    },
    addBus: function(name){
      this.bus.push(name)
      return false
    },
    removeBus: function(name){
      var bus = this.bus
      var index = jQuery.inArray(name, bus)
      if (index > -1) {
        bus.splice(index, 1);
      }
      return false
    },
    getBus: function(){
      return this.bus
    },
    checkLoaded: function() {
      return {"destination": this.destination, "mission": this.mission,
              "bus": this.bus, "payload": this.payload}
    },
    printParams: function() {
      /*bus_keys = Object.keys(this.bus)
      payload_keys = Object.keys(this.payload)
      for (var i = 0; i < bus_keys.length; i++){
        this.parameters += '&' + bus_keys[i] + '=bus'
      }
      for (var i = 0; i < payload_keys.length; i++){
        this.parameters += '&' + payload_keys[i] + '=bustrue'
      }*/
      return this.params
    },
    setParams: function(params){
      this.params = params
    },
    getError: function(){
      return this.simError
    },
    setError: function(error){
      this.SimError = error;
      return false
    },
    printError: function(error){
      return alert(error);
    },
  }
};

