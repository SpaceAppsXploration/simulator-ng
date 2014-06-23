define(['angular', 'services'], function(angular, services) {
	'use strict';

  /* Directives */

	angular.module('myApp.directives', ['myApp.services'])
        .directive('target', function() {
            function link(scope,obj, attrs) {
                var planet_id;
                scope.$watch('Page.selected', function(obj, attrs) {
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
console.log(scope.Page);
                       var list = scope.Page.physics;
                       var body;
                       if(planet_id == 2) body = list[0];
                       else
                       {
                            body = list.filter(function (o) {
                                console.log(o.target);

                                return o.target == planet_id;
                            });

                        }
console.log(body)
                       if(typeof body != 'undefined' && body.length != 0) {
                           $('physics').text("");
                            delete body.target;
                            delete body.discover;
                            delete body.name;
                            var physics = JsonHuman.format(body);
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
        })


});

