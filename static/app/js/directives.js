define(['angular', 'services'], function(angular, services) {
	'use strict';


    var genColor = function(seed) {
        var color = Math.floor((Math.abs(Math.sin(seed) * 16777215)) % 16777215);
        color = color.toString(16);
        // pad any colors shorter than 6 characters with leading 0s
        while(color.length < 6) {
            color = '0' + color;
        }

        return '#'+color;
    };

  /* Directives */

	angular.module('myApp.directives', ['myApp.services'])
        .directive('selectedmenu', function() {
            function link(scope,obj, attrs) {
                var model = scope.Model;
                scope.$watch('Model', function(obj, attrs) {
                   if(model != null && model.destination != null) {
                       $('#selected').html('').append('<div class="col-sm-2"><img class="img-rounded img-mini" src="'+ model.destination.image_url +'"/><span class="text">'+ model.destination.name +'</span></div>');
                   } else $('#selected').html('').append("<span>No selections made</span>");
                   if(model != null && model.mission != null) {
                       $('#selected').append('<div class="col-sm-2"><img class="img-rounded img-mini" src="'+ model.mission.image_url +'"/><span class="text">'+ model.mission.name +'</span></div>')
                   }
                   if(model != null && model.payloads != null && model.payloads.length != 0) {
                       var payloads = model.payloads;
                       var print = '';
                       for(var i in payloads){
                           print += payloads[i]+' ';
                       }
                       $('#selected').append('<div class="col-sm-2"><img class="img-rounded img-mini" src="http://placehold.it/50x50"/><span class="text">'+ print +'</span></div>')
                   }
                   if(model != null && model.bus != null && model.bus.length != 0) {
                       var bus = model.bus;
                       var print = '';
                       for(var i in bus){
                           print += bus[i]+' ';
                       }
                       $('#selected').append('<div class="row"><img class="img-rounded img-mini" src="http://placehold.it/50x50"/><span class="text">'+ print +'</span></div>')
                   }
                }, true);
            }
            return({
                scope: false,
                link: link,
                restrict: "A"
            });
        })
        /*************************************** Directives for Start Controller **************************************/
        .directive('target', function() {
            function link(scope, obj, attrs) {
                //console.log('directive loaded:', attrs.target);
                var element = obj; /* html element */
                var figure;
                var planet;
                planet = scope.$eval(attrs.target); /* destination object in html element */
                figure = genColor(planet.id); /* generate destination color from seed */

                obj.bind('mouseenter', function(event){
                    //console.log('start:hover', element.slug);

                    if (scope.Page.selection != true) { /* if there is not an already selected element */
                        if (element.css('color') != 'rgb(255, 255, 255)') {
                            element.css('color', figure);
                            scope.safeApply(function () { scope.Page.highlight = planet; });
                        }
                        else scope.safeApply(function () { scope.Page.highlight = planet; });
                    }
                });
                obj.bind('mouseleave', function(event){
                    //console.log(element.css('color'));
                    if (scope.Page.selection != true) {  /* if there is not an already selected element */
                        if (element.css('color') != 'rgb(255, 255, 255)') {
                            element.css('color', '#c8d2d2');
                            scope.safeApply(function () { scope.Page.highlight = null; });
                        }
                        else scope.safeApply(function () { scope.Page.highlight = null; });
                    }
                });
                obj.bind('click', function(event){
                    $('.names').css('color', '#c8d2d2');
                    element.css('color', figure); /* highlight selected */

                    //console.log(figure, planet.id);

                    scope.$apply(function() {
                        scope.Page.selection = true; /* a destination is selected >>> true */
                        scope.Page.highlight = planet; /* what destination is selected (watched by description and data) */
                        scope.Page.destcolor = figure; /* color of the selected destination */
                        scope.resetError();
                        scope.setDestination(planet); /* controller function is triggered */
                    });

                    var scroll = $('#oval').css('border', '2px solid'+figure.toString()).fadeIn('slow').offset().top;
                    /* set shape color and scroll down to goal selection */
                    $('html, body').animate({scrollTop: scroll}, 'easeOutQuint');
                });
                scope.$watch('Page.highlight', function (obj, attrs) {
                  if (typeof scope.Page.highlight != 'undefined') {
                      $('.goals-row').show();
                      if (scope.Page.highlight == null) { // triggered on mouseleave
                          $('#physics').text("");
                      }
                      else { // triggered on mouseenter
                          //console.log(obj);
                          /** update description DEPRECATED **/
                          //$('#description').text("").append('<p>' + obj.characteristics + '</p>');
                          //$('#description').append('<img class="media-object img-rounded img-responsive targets" src="' + obj.image_url + '"/>');

                          /** update physics **/
                          var list = scope.Page.physics;
                          var body;
                          if (obj.id == 2) body = list[0];
                          else {
                            body = list.filter(function (o) {
                            //console.log(o.target);
                            return o.target == obj.id;
                            });
                          }

                          if (typeof body != 'undefined' && body.length != 0) {
                              var print = body;
                              if(print.target) delete print.target;
                              if(print.discover) delete print.discover;
                              if(print.name) delete print.name;
                              if(print.active) delete print.active;
                              var physics = JsonHuman.format(print);
                              //console.log(physics)
                              $('#physics').text("").append('<div id="t-resp" class="table-responsive"></div>');
                              $('#t-resp').append(physics);
                          } else {
                              $('#physics').text("").html("No Data For This Body.");
                          }
                      }
                  }
                });

            }
            return({
                scope: false,
                link: link,
                restrict: "A"
            });
        })
        .directive('goal', function() {
            function link(scope, obj, attrs) {
                //console.log('directive loaded:', attrs.target);
                var element = obj;
                var mission =  scope.$eval(attrs.goal);
                //console.log(attrs.goal);

                var goalcolor = genColor(mission.id); /* generate a color for mission's goal */

                obj.bind('mouseenter', function(event){
                    //console.log('start:hover', element.slug);
                    element.css('color', goalcolor);
                    element.parent().next().children('.gdesc').first().css('color', '#fff');
                    scope.safeApply(function(){ scope.Page.mission = mission; });
                    var destcolor = scope.Page.destcolor;
                    $('#oval').css('border', 'none')
                              .css('background', '-webkit-linear-gradient(left,'+destcolor+', '+goalcolor +')')
                              .css('background', '-o-linear-gradient(right,'+destcolor+', '+goalcolor +')')
                              .css('background', '-moz-linear-gradient(right,'+destcolor+', '+goalcolor +')')
                              .css('background', 'linear-gradient(to right,'+destcolor+', '+goalcolor +')');
                });
                obj.bind('mouseleave', function(event){
                    //console.log('stop:hover', event.target);
                    element.css('color', '#c8d2d2');
                    element.parent().next().children('.gdesc').first().css('color', '#c8d2d2');
                    scope.safeApply(function(){scope.Page.mission = null; });

                    $('#oval').css('border', '2px solid'+scope.Page.destcolor)
                              .css('background', 'none')
                });
                obj.bind('click', function(event){
                    var destcolor = scope.Page.destcolor;
                    $('#oval').css('background', '-webkit-linear-gradient(left,'+destcolor+', '+goalcolor +')')
                              .css('background', '-o-linear-gradient(right,'+destcolor+', '+goalcolor +')')
                              .css('background', '-moz-linear-gradient(right,'+destcolor+', '+goalcolor +')')
                              .css('background', 'linear-gradient(to right,'+destcolor+', '+goalcolor +')');
                    scope.chooseG(mission);
                });
            }
            return({
                scope: false,
                link: link,
                restrict: "A"
            });
        })
        /************************************ Directives for Payloads controller *************************************/
        .directive('payload', function() {
            function link(scope, obj, attrs) {
                //console.log('directive loaded:', attrs.payload);
                var element = obj;
                /* html element */
                var pl =  scope.$eval(attrs.payload);
                /* payload object in html element */

                obj.bind('mouseenter', function (event) {
                    //console.log('start:hover', scope.Page.plslots);
                    element.css('color', '#ccc');
                    var slots = scope.Page.plslots;
                    var slug = pl.slug;

                    for (var i in slots){
                        if (slots[i].status == false) {
                            scope.$apply(function () {
                                scope.Page.plslots[i].value = pl;
                                scope.Page.plslots[i].slug = pl.slug;
                            });
                            scope.Page.assembling = i;
                            break
                        }
                        else{
                            if(slug == slots[i].slug){
                                scope.simError = 'this payload is already assembled';
                                console.log(scope.simError);
                                break
                            }
                        }
                    }
                });
                obj.bind('mouseleave', function (event) {
                    //console.log(element.css('color'));
                    element.css('color', '#888');
                    var slots = scope.Page.plslots;
                    for (var i in slots) {
                        if (slots[i].status == false){
                            scope.$apply(function () {
                                slots[i].value = null;
                                slots[i].slug = null;
                            });
                            break
                        }

                    }
                });
                obj.bind('click', function (event) {
                    element.css('color', '#fff');
                    /* higlight selected */
                    //console.log('Click', scope.Page.plslots);
                    scope.$apply(function () {
                        scope.Page.plslots[scope.Page.assembling].status = true;
                        scope.togglePayload(scope.Page.plslots[scope.Page.assembling].value);
                    });
                    var slots = scope.Page.plslots;
                    for (var i in slots) {
                        if (slots[i].value == null && slots[i].slug == null) slots[i].status = false
                    }

                    if (scope.Page.plslots[3].status == true) {
                          var scroll = $('#row-bus').offset().top;
                          /* set shape color and scroll down to goal selection */
                          $('html, body').animate({scrollTop: scroll}, 'easeOutQuint');
                    }


                });


            }
            return({
                scope: false,
                link: link,
                restrict: "A"
            });
        })
        .directive('bustype', function() {
            function link(scope, obj, attrs) {
                var element = obj;
                var bus = scope.Page.bus;
                var type = scope.$eval(attrs.bustype);

                obj.bind('mouseenter', function (event) {
                    //console.log('start:hover', scope.Page.plslots);
                    element.css('color', '#ccc');
                    var slots = scope.Page.busslots;
                    var counter = attrs.datacounter;
                                        //console.log(bus[counter])

                    if (slots[1].status == false) {
                        scope.$apply(function () {
                            slots[1][1].value = bus[counter][0];
                            slots[1][1].slug = type;

                            slots[1][2].value = bus[counter][1];
                            slots[1][2].slug = type;
                            //console.log(slots)
                        });
                    }
                    else if (slots[2].status == false) {
                        scope.$apply(function () {
                            slots[2][1].value = bus[counter][0];
                            slots[2][1].slug = type;

                            slots[2][2].value = bus[counter][1];
                            slots[2][2].slug = type;
                            //console.log(slots)
                        });
                    }

                });
                obj.bind('mouseleave', function (event) {
                    //console.log(element.css('color'));
                    element.css('color', '#888');

                });

            }
            return({
                scope: false,
                link: link,
                restrict: "A"
            });
        })
        .directive('buscomp', function() {
            function link(scope, obj, attrs) {
                var element = obj;
                var slotn = attrs.busslot;
                var compn = attrs.buscomp;

                obj.bind('click', function (event) {
                    element.css('color', '#fff');
                                    //console.log(scope.Page.busslots[slotn][compn].value);
                    scope.$apply(function () {
                        scope.Page.busslots[slotn].status = true;
                        scope.toggleBUS(scope.Page.busslots[slotn][compn].value);
                    });


                });

            }
            return({
                scope: false,
                link: link,
                restrict: "A"
            });
        })
        /* Directives for Results controller */
        .directive('similars', function() {
            function link(scope, obj, attrs) {
                function collect(data) {
                   console.log(data);
                        var missions = '';
                        var data = data;
                        for (var i = 0; i < data.length; i++) {
                            var obj = data[i];
                            var header = obj['header'];
                            header = header.split(' ');
                            header = header.slice(0, 6);
                            header = header.join(' ');
                            var mission;
                            var image;
                            var mission_link;
                            if (obj.mission != null) {
                                image = obj.mission.image_url;
                                mission = obj.mission.id;
                                mission_link = obj.mission.link_url;
                            }
                            else {
                                image = 'http://placehold.it/80x80';
                                mission = '#';
                                mission_link = '';
                            }
                            missions += '<div class="list-group"> \
                                        <div class="list-group-item"> \
                                        <div class="media col-md-3"> \
                                        <figure class="pull-left"> \
                                        <img class="media-object img-rounded img-responsive" src="' + image + '" alt="" style="width=auto; height:80px;" > \
                                        </figure> \
                                        </div> \
                                        <div class="col-md-6"> \
                                        <h5 class="list-group-item-heading">' + header + '...</h5> \
                                        <p class=""> \
                                        <a target="_blank" href="' + obj.body + '"> Go to data</a> \
                                        </p> \
                                        <p class=""> \
                                        <a target="_blank" href="' + mission_link + '"> Mission&apos;s website</a> \
                                        </p> \
                                        <p> \
                                        <a target="_blank" href="/webapp/data/missions/details/' + mission + '">See Details</a> \
                                        </p> \
                                        </div> \
                                        </div> \
                                        </div>';
                        }
                        return missions
                }

                if (typeof scope.Page.ratings.loaded != 'undefined') {
                    scope.$watch('Page.sci_data.loaded', function (obj, attrs) {
                        if (obj != false) {
                            $('#similars').html('');
                            var data = scope.Page.sci_data.value;
                            //console.log('SCI_DATA_DIRECTIVE', data);

                            if (data.length != 0) {
                                var missions = collect(data);
                                $('#similars').append(missions);
                            }
                            else $('#similars').append('<span style="font-size:16px;">No data for these target/payloads combination. Try again!</span>');


                        }

                    });
                }
            }
            return({
                scope: false,
                link: link,
                restrict: "A"
                });
        })
        .directive('ratings', function() {
            function link(scope,obj, attrs) {
                if (typeof scope.Page.ratings.loaded != 'undefined') {
                    scope.$watch('Page.ratings.loaded', function (obj, attrs) {
                        if (obj != false) {
                            $('#ratings').html('');
                            var data = scope.Page.ratings.value;
                            var rates = JsonHuman.format(data);
                            $('#ratings').append('<div id="t-ratings" class="table-responsive"></div>');
                            $('#t-ratings').append(rates);
                        }

                    });
                }
            }
            return({
                scope: false,
                link: link,
                restrict: "A"
                });
        })
        /*
        .directive('start', function() {
            function link(scope,obj, attrs) {
                obj.bind('mouseenter', function(event){
                   console.log('start:hover', event.target)
                });
            }

            return({
                scope: false,
                link: link,
                restrict: "A"
                });
        })
        */
        .directive('compsmenu', function() {
            function link(scope,obj, attrs) {
                if (typeof scope.Page.pl != 'undefined') {
                    scope.$watch('Page.pl', function (obj, attrs) {
                        console.log('PL loaded', obj, attrs);


                    });
                }
            }
            return({
                scope: false,
                link: link,
                restrict: "A"
                });
        });


});

