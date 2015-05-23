module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
          banner: "/*! <%= pkg.name %> v<%= pkg.version %> */\n(function(){\n'use strict';\n",
          footer: '\n}());'
      },
      dist: {
        src: ['src/**/*.src.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {},
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['src/**/*.src.js'],
      options: {
        // options here to override JSHint defaults
        // ref: http://jshint.com/docs/options/
        curly: true,
        eqeqeq: true,
        maxparams: 3,
        undef: false,
        bitwise: true,
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    githooks: {
      options: {
        // Task-specific options go here. 
      },
      all: {
        options: {
          // Target-specific options go here 
        },
      'pre-commit': 'concat uglify jshint qunit',
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'concat', 'uglify', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-githooks');

  grunt.registerTask('test', ['qunit']);
  grunt.registerTask('default', ['githooks', 'concat', 'uglify', 'jshint', 'qunit']);
  grunt.registerTask('watch', ['default', 'watch']);

};
