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
                       $('#selected').html('').append('<div class="row"><img class="img-rounded img-mini" src="'+ model.destination.image_url +'"/><span class="text">'+ model.destination.name +'</span></div>');
                   } else $('#selected').html('').append("<span>No selections made</span>");
                   if(model != null && model.mission != null) {
                       $('#selected').append('<div class="row"><img class="img-rounded img-mini" src="'+ model.mission.image_url +'"/><span class="text">'+ model.mission.name +'</span></div>')
                   }
                   if(model != null && model.payloads != null && model.payloads.length != 0) {
                       var payloads = model.payloads;
                       var print = '';
                       for(var i in payloads){
                           print += payloads[i]+' ';
                       }
                       $('#selected').append('<div class="row"><img class="img-rounded img-mini" src="http://placehold.it/50x50"/><span class="text">'+ print +'</span></div>')
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

        .directive('target', function() {
            function link(scope, obj, attrs) {
                //console.log('directive loaded:', attrs.target);
                var element = obj; /* html element */
                var planet = $.parseJSON(attrs.target); /* destination object in html element */

                obj.bind('mouseenter', function(event){
                    //console.log('start:hover', element.slug);
                    if (scope.Page.selection != true) { /* if there is not an already selected element */
                        if (element.css('color') != 'rgb(255, 255, 255)') {
                            element.css('color', '#ccc');
                            scope.safeApply(function () { scope.Page.highlight = planet; });
                        }
                        else scope.safeApply(function () { scope.Page.highlight = planet; });
                    }
                });
                obj.bind('mouseleave', function(event){
                    //console.log(element.css('color'));
                    if (scope.Page.selection != true) {  /* if there is not an already selected element */
                        if (element.css('color') != 'rgb(255, 255, 255)') {
                            element.css('color', '#888');
                            scope.safeApply(function () { scope.Page.highlight = null; });
                        }
                        else scope.safeApply(function () { scope.Page.highlight = null; });
                    }
                });
                obj.bind('click', function(event){
                    $('.names').css('color', '#888');
                    element.css('color', '#fff'); /* higlight selected */

                    var figure = genColor(planet.id); /* generate destination color from seed */
                    //console.log(figure, planet.id);

                    scope.$apply(function() {
                        scope.Page.selection = true; /* a destination is selected >>> true */
                        scope.Page.highlight = planet; /* what destination is selected (watched by description and data) */
                        scope.Page.destcolor = figure; /* color of the selected destination */
                        scope.setDestination(planet); /* controller function is triggered */
                    });

                    var scroll = $('#oval').css('background', figure.toString()).fadeIn('slow').offset().top;
                    /* set shape color and scroll down to goal selection */
                    $('html, body').animate({scrollTop: scroll}, 'easeOutQuint');
                });
                scope.$watch('Page.highlight', function (obj, attrs) {
                  if (typeof scope.Page.highlight != 'undefined') {
                      $('#goals-row').show();
                      if (scope.Page.highlight == null) { // triggered on mouseleave
                          $('#description').text("");
                          $('#physics').text("");
                      }
                      else { // triggered on mouseenter
                          //console.log(obj);

                          /** update description **/
                          $('#description').text("").append('<p>' + obj.characteristics + '</p>');
                          //$('#description').append('<img class="media-object img-rounded img-responsive targets" src="' + obj.image_url + '"/>');

                          var list = scope.Page.physics;
                          var body;
                          if (obj.id == 2) body = list[0];
                          else {
                            body = list.filter(function (o) {
                            //console.log(o.target);
                            return o.target == obj.id;
                            });
                          }
                          /** update physics **/
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
                var mission = $.parseJSON(attrs.goal);
                //console.log(attrs.goal);

                var goalcolor = genColor(mission.id); /* generate a color for mission's goal */

                obj.bind('mouseenter', function(event){
                    //console.log('start:hover', element.slug);
                    element.css('color', '#ccc');
                    element.parent().next().children('.gdesc').first().css('color', '#fff');
                    scope.safeApply(function(){ scope.Page.mission = mission; });
                    var destcolor = scope.Page.destcolor;
                    $('#oval').css('background', '-webkit-linear-gradient(left,'+destcolor+', '+goalcolor +')')
                              .css('background', '-o-linear-gradient(right,'+destcolor+', '+goalcolor +')')
                              .css('background', '-moz-linear-gradient(right,'+destcolor+', '+goalcolor +')')
                              .css('background', 'linear-gradient(to right,'+destcolor+', '+goalcolor +')');
                    console.log(destcolor, goalcolor, mission.id);

                });
                obj.bind('mouseleave', function(event){
                    //console.log('stop:hover', event.target);
                    element.css('color', '#888');
                    element.parent().next().children('.gdesc').first().css('color', '#ccc');
                    scope.safeApply(function(){scope.Page.mission = null; })

                    $('#oval').css('background', scope.Page.destcolor)
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

