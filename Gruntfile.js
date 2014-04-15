module.exports = function (grunt) {
	grunt.initConfig({
	  ender: {
	    options: {
	      output: "ender",
	      dependencies: ["bean", "bonzo@v1.4.0", "qwery"]
	    }
	  }
	});
	grunt.loadNpmTasks('grunt-ender');

	grunt.registerTask('default', ['ender']);
};