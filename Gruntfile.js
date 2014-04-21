module.exports = function (grunt) {
	grunt.initConfig({
	  ender: {
	    options: {
	      output: "ender",
	      dependencies: ["bean", "bonzo@v1.4.0", "qwery"]
	    }
	  },
	  requirejs: {
	    compile: {
	      options: {
	        baseUrl: ".",
	        name: "dist/modal/modal.js", // assumes a production build using almond
	        out: "all/mink-all.js",
	        preserveLicenseComments: false,
	        generateSourceMaps: true,
	        optimize: "uglify2"
	      }
	    }
	  }
	});
	grunt.loadNpmTasks('grunt-ender');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	grunt.registerTask('default', ['ender']);
};