module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    shell: {
      ender: {
        command: 'ender build bean bonzo@v1.4.0 qwery@3.4.2 ender-mink --output ender --sandbox ender-core && ender refresh'
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
    },
    concat: {
      css: {
        src: ['dist/**/*.css'],
        dest: 'all/mink.css',
      },
    },
    bump: {
      options: {
        files: ['package.json', '*/package.json', '*/*/package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release %VERSION%',
        commitFiles: ['package.json', 'base/package.json', 'ender/package.json', 'dist/modal/package.json'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },
    docco: {
      debug: {
        src: [
          'base/**/*.js',
          'spec/assets/*.js'
        ],
        options: {
          css: 'spec/assets/docco.css',
          output: 'spec/docs/'
        }
      }
    }
  });


  grunt.registerTask('default', ['shell', 'concat:css']);
};