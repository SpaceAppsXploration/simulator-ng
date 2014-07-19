define(['angular', 'services'], function (angular, services) {
	'use strict';

	/* Filters */
  
	angular.module('myApp.filters', ['myApp.services'])
		.filter('interpolate', ['version', function(version) {
			return function(text) {
				return String(text).replace(/\%VERSION\%/mg, version);
			};
	    }])
        .filter('assembled', function(){
            return function(text){
                if((typeof text == 'undefined') || (text == null)){
                    return ''
                }
                else return text + ' assembled';
            }
        });
});
