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
                   }
                   if(model != null && model.mission != null) {
                       $('#selected').append('<div class="row"><img class="img-rounded img-mini" src="'+ model.mission.image_url +'"/><span class="text">'+ model.mission.name +'</span></div>')
                   }
                   if(model != null && model.payloads != null && model.payloads.length != 0) {
                       $('#selected').append('<div class="row"><img class="img-rounded img-mini" src="http://placehold.it/50x50"/><span class="text">'+ toString(model.payloads) +'</span></div>')
                   } else $('#selected').html('').append("<span>No selections made</span>");


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
                scope.$watch('Page.highlight', function(obj, attrs) {
                        planet_id = obj.id;
                        //console.log('directive target change', attrs);
                      /** update description **/
                        $('description').text("");
                        $('description').append('<img class="media-object img-rounded img-responsive targets" src="'+obj.image_url+'"/>');
                        $('description').append('<p>'+obj.characteristics+'</p>');
                        var el = $('#'+obj.slug);
                        el.parent().find('a').removeClass('active');
                        el.addClass('active');

                      /** update physics **/
                       var list = scope.Page.physics;
                       var body;
                       if(planet_id == 2) body = list[0];
                       else
                       {
                            body = list.filter(function (o) {
                                //console.log(o.target);
                                return o.target == planet_id;
                            });

                        }
//console.log(body)
                       if(typeof body != 'undefined' && body.length != 0) {
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
                      /** update selected menu **/


                });

            }
            return({
                scope: false,
                link: link,
                restrict: "A"
                });
        });

});

