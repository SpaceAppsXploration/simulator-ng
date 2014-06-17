module.exports = function(config) {
	config.set({
		basePath: '../',
		frameworks: ['jasmine', 'requirejs'],
		files: [
			{pattern: '/static/app/js/*.js', included: false},
			{pattern: '/static/app/js/**/*.js', included: false},
			{pattern: '/static/test/unit.js', included: false},
			{pattern: '/static/test/unit/*.js', included: false},
			{pattern: '/static/test/unit/**/*.js', included: false},
			{pattern: '/static/bower_components/**/*.js', included: false},
			// needs to be last http://karma-runner.github.io/0.10/plus/requirejs.html
			'/static/test/main-test.js'
	],

	autoWatch: true,

	LogLevel: config.LOG_DEBUG,

	browsers: ['Firefox'],

	junitReporter: {
		outputFile: '/static/test_out/unit.xml',
		suite: 'unit'
	}
	});
};
