/**!
*
* DOMFlow
* Controls Presentation In The Browser 
*
* Copyright(c) 2014 Lorenzo <tunedconsulting@gmail.com>
* MIT Licensed
*
*/


'use strict'

var DOMFlow = {
  status: null, 
  startDesign: function(destination, construct){
    var destination = destination
    if (typeof construct != "function") console.log('Error! Wrong Construct')

    if (DOMFlow.status) delete DOMFlow.status 

    DOMFlow.status = new construct(destination, null, [], [], '', null)
    console.log(DOMFlow.status)
    $('#stage-1').fadeOut('slow');
    $('#stage-2').fadeIn('slow');
    $('body').addClass('milkyway');
    DOMFlow.status.setDestination(destination)
    console.log(DOMFlow.status.getDestination())
    $('#show-dest2').text('Your mission is going to ' + destination)
  },
  goToPLDesign: function(params){

    $('#stage-2').fadeOut('slow');
    $('#stage-3').fadeIn('slow');
    DOMFlow.scrollUp()
    DOMFlow.status.setError(null)

    console.log(DOMFlow.status)
    
    var target = DOMFlow.status.getDestination()
    var mission = DOMFlow.status.getMission()
    $('#show-dest3').text('Your mission is going to ' + target)
    $('#show-dest3').parent().parent().append('<li><i class="glyphicon glyphicon-ok"></i><span>Mission goal: '+ mission +'</span></li>')
  },
  goToBusDesign: function(params){

    $('#stage-3').fadeOut('slow');
    $('#stage-4').fadeIn('slow');
    DOMFlow.scrollUp()
    DOMFlow.status.setError(null)
    
    var target = DOMFlow.status.getDestination()
    var mission = DOMFlow.status.getMission()
    var payload = DOMFlow.status.getPayloads()
    payload = String(payload).replace(/=true/g, '')
    $('#show-dest4').text('Your mission is going to ' + target)
    $('#show-dest4').parent().parent().append('<li><i class="glyphicon glyphicon-ok"></i><span>Mission goal: '+ mission +'</span></li>')
    $('#show-dest4').parent().parent().append('<li><i class="glyphicon glyphicon-ok"></i><span>Instruments: '+ payload +'</span></li>')
  },
  takeOff: function(params){
    $('#stage-5').fadeIn('slow');
    $('#stage-4').fadeOut('slow');
    DOMFlow.scrollUp()
    DOMFlow.status.setError(null)

    var totals = new Array()
    totals[0] = DOMFlow.status.getDestination()
    totals[1] = DOMFlow.status.getMission()
    totals[2] = DOMFlow.status.getPayloads()
    totals[3] = DOMFlow.status.getBus()

    var target = totals[0]
    totals = JSON.stringify(totals);
    console.log(totals)
    console.log(target)
    Socketing.send_ack('{"query": "get_ratings", "object": ' + totals + '}', DOMFlow.printRatings, target)
    //setInterval(Socketing.send_ack('{"query": "get_missions", "object": "' + target + '"}', DOMFlow.printMissions, null),1000)

  },
  getTarget: function(json){
    $('#controls').attr('body', json.id)
    $('#controls-data').text("");

    $('#controls-data').append('<img class="media-object img-rounded img-responsive targets" src="'+json.image_url+'"/>');
    $('#controls-data').append('<p>'+json.characteristics+'</p>');
  },
  getPhysics: function(json){
    if(json.code == 1){ $('#controls-data').text("no data for this body"); return false}
    
    $('#controls-data').text("");
    delete json.target
    delete json.discover
    delete json.name
    var physics = JsonHuman.format(json);
    //console.log(physics)
    $('#controls-data').append('<div id="t-resp" class="table-responsive"></div>');
    $('#t-resp').append(physics);
  },
  scrollUp: function(){
    $('html, body').animate({scrollTop:0}, 'slow');
    /*$('.popupPeriod').fadeIn(1000, function(){
        setTimeout(function(){$('.popupPeriod').fadeOut(2000);}, 3000);
    });*/
  },
  containsElem : function(obj, list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
      }

      return false;
    },
    printRatings: function(data){
      var data = data
      var rates = JsonHuman.format(data);
      $('#ratings').append('<div id="t-ratings" class="table-responsive"></div>');
      $('#t-ratings').append(rates);
    },
    printMissions: function(data){
      var data = data;
      console.log(data)
      
      function collect(data){
        var missions = '';
        var data = data;
        for (var i = 0; i < data.length ; i++) {
          missions += '<div class="list-group"> \
                      <div class="list-group-item"> \
                          <div class="media col-md-3"> \
                              <figure class="pull-left"> \
                                  <img class="media-object img-rounded img-responsive"  src="'+data[i].image_url+'" alt="" style="width=auto; height:80px;" > \
                              </figure> \
                          </div> \
                          <div class="col-md-6"> \
                              <h4 class="list-group-item-heading">'+data[i].codename+'</h4> \
                              <p class="">  \
                                  <a target="_blank" href="'+data[i].link_url+'"> Website</a>  \
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
      console.log()
      $('#similars').append(missions);

    },
};