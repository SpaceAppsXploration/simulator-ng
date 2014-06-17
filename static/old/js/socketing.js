/**!
*
* Socketing
* Controls Communications Via Socket
*
* Copyright(c) 2014 Lorenzo <tunedconsulting@gmail.com>
* MIT Licensed
*
*/


'use strict'

var Socketing = {
    
    send_ack: function(msg, callback, params){
      var data;
      var params = params
        if (typeof callback == "function") {
      
      var callback = callback;
        }
        else var callback = null;
      if (sock && sock.readyState === 1) {
          
          sock.send(msg); //send message to server

          sock.onmessage = function(e) { //server messages receiver
              data = jQuery.parseJSON(e.data);
              
              //Handling different server responses
              if (data.data_type == 'get_target') {
                //show targets infos
                callback(data.data)

              }
              else if (data.data_type == 'get_physics'){
                //show physical infos
                callback(data.data)   

              }
              else if (data.data_type == 'destination-mission' 
                        || data.data_type == 'set-payload'
                           || data.data_type == 'set-bus') {
                // checking if destination-mission combo is right
                if (data.data.code == 1) {
                    //error in combo
                    if (data.data_type == 'destination-mission') DOMFlow.status.setMission(null)
                    DOMFlow.status.printError(data.data.message+" : "+ data.data.content)
                }
                else {
                    if (data.data_type == 'destination-mission') DOMFlow.status.setMission(params)
                    if (data.data_type == 'set-payload') DOMFlow.status.setParams(params)
                    if (data.data_type == 'set-bus') DOMFlow.status.setParams(params)
                    callback() // >>> Go to stage 3 or 4
                }
              }

              else if (data.data_type == 'get_ratings') {
                console.log(data.data)
                console.log(params)
                callback(data.data) // >>> stage 5: printRatings
                Socketing.send_ack('{"query": "get_missions", "object": "' +  params + '"}', DOMFlow.printMissions, null)
              }

              else if (data.data_type == 'get_missions') {

                callback(data.data) // >>> stage 5: pritnMissions

              }
              else { 
                /* just echo */ 
                Socketing.return_echo(data)
              }
            
          }
        }

    else console.log('Cannot send message. Socket is Closed!')
    },

    onopen: function() {
        console.log(msg)
        //console.log(sock.readyState)
        //clearInterval(recInterval);
        Socketing.send_ack('{"query": "get_target", "object": "' + $('#init').attr("data-id") + '"}', 
                            DOMFlow.getTarget)
    },

    onclose: function () {
        console.log('socket closed')
        //recInterval = setInterval(function () {
        //    connect(host, msg);
        //}, 2000);
    },

    raise_error: function(error){
      raise_error(error)
    },
    return_target: function(target){
      return_target(target)
    },
    return_physics: function(physics){
      return_physics(physics)
    },
    return_echo:  function(echo){
        return_echo(echo)
    }


};