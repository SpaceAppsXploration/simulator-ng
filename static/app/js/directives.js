define(['angular', 'services'], function(angular, services) {
	'use strict';

  /* Directives */

	angular.module('myApp.directives', ['myApp.services'])
        .directive('selectedmenu', function() {
            function link(scope,obj, attrs) {
                console.log(scope.Model);
                var model = scope.Model;
                scope.$watch('model', function(obj, attrs) {
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
                });
            }
            return({
                scope: false,
                link: link,
                restrict: "A"
            });
        })

        .directive('target', function() {
            function link(scope,obj, attrs) {
                var planet_id;
                if(typeof scope.Page.highlight != 'undefined') {
                    scope.$watch('Page.highlight', function (obj, attrs) {
                        planet_id = obj.id;
                        //console.log('directive target change', attrs);
                        /** update description **/
                        $('description').text("");
                        $('description').append('<img class="media-object img-rounded img-responsive targets" src="' + obj.image_url + '"/>');
                        $('description').append('<p>' + obj.characteristics + '</p>');
                        var el = $('#' + obj.slug);
                        el.parent().find('a').removeClass('active');
                        el.addClass('active');

                        /** update physics **/
                        var list = scope.Page.physics;
                        var body;
                        if (planet_id == 2) body = list[0];
                        else {
                            body = list.filter(function (o) {
                                //console.log(o.target);
                                return o.target == planet_id;
                            });
                        }
//console.log(body)
                        if (typeof body != 'undefined' && body.length != 0) {
                            $('physics').text("");
                            var print = body;
                            delete print.target;
                            delete print.discover;
                            delete print.name;
                            delete print.active;
                            var physics = JsonHuman.format(print);
                            //console.log(physics)
                            $('physics').append('<div id="t-resp" class="table-responsive"></div>');
                            $('#t-resp').append(physics);
                        } else {
                            $('physics').text("");
                            $('physics').html("No Data For This Body.");
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
                                        <h4 class="list-group-item-heading">' + header + '...</h4> \
                                        <p class=""> \
                                        <a target="_blank" href="' + obj.body + '"> Go to data</a> \
                                        </p> \
                                        <p class=""> \
                                        <a target="_blank" href="' + mission_link + '"> Mission&apos; website</a> \
                                        </p> \
                                        <p> \
                                        <a target="_blank" href="http://www.spacexplore.it/webapp/data/missions/details/' + mission + '">See Details</a> \
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
                            else $('#similars').append('no data for these target/payloads combination. Try again!');


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

