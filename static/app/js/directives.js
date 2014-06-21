define(['angular', 'services'], function(angular, services) {
	'use strict';

  /* Directives */

	angular.module('myApp.directives', ['myApp.services'])
        .directive('target', function(socketService) {
            function link(scope,obj, attrs) {
                var planet_id;
                scope.$watch('Page.selected', function(obj, attrs) {
                        planet_id = obj.id;
                        //console.log('directive target change', attrs);
                      /** update description **/
                        $('description').text("");
                        $('description').append('<img class="media-object img-rounded img-responsive targets" src="'+obj.image_url+'"/>');
                        $('description').append('<p>'+obj.characteristics+'</p>');
                        var el = $('#'+obj.slug)
                        el.parent().find('a').removeClass('active');
                        el.addClass('active');

                });
                       /** update physics
                scope.$watch('Page.physics', function(obj, attrs) {
                        var planet = obj.filter(function( obj ) {
                            return obj.id == planet_id;
                        });
                        planet = planet[0]

                        if(planet.code == 1){ $('#controls-data').text("no data for this body"); return false;}

                        $('physics').text("");


                        delete planet.target;
                        delete planet.discover;
                        delete planet.name;
                        var physics = JsonHuman.format(planet);
                        //console.log(physics)
                        $('physics').append('<div id="t-resp" class="table-responsive"></div>');
                        $('#t-resp').append(physics);

                });**/
            }
            return({
                scope: false,
                link: link,
                restrict: "A"
                });
        });
});

