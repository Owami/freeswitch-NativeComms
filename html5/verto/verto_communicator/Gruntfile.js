/*jslint node: true */
'use strict';

// var pkg = require('./package.json');

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);
  
  // load all grunt tasks
  require('jit-grunt')(grunt, {
    includereplace: 'grunt-include-replace',
    useminPrepare: 'grunt-usemin'
  });

  // Configurable paths
  var config = {
    app: '.',
    dist: 'dist'
  };

  var ip = grunt.option('ip') || 'localhost';

  // Project configuration.
  grunt.initConfig({
    // Project settings
    config: config,

    // Watch things 
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['js/verto-service.js'],
        tasks: ['includereplace:dev']
      },
      styles: {
        files: ['<%= config.app %>/css/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'postcss']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // Replace so we can have it properly passed from dev
    includereplace: {
      dev: {
        options: {
          globals: {
            ip: ip
          },
        },
        src: 'js/verto-service.js',
        dest: '.tmp/js/verto-service.js'
      },
      prod: {
        options: {
          globals: {
            ip: ip
          },
        },
        src: 'js/verto-service.js',
        dest: 'dist/js/'
      }      
    },
    wiredep: {
      app: {
        src: ['index.html'],
        ignorePath:  /\.\.\//
      }
    },

    postcss: {
      options: {
        map: true,
        processors: [
          // Add vendor prefixed styles
          require('autoprefixer-core')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
          })
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    browserSync: {
      options: {
        notify: false,
        background: true,
        https: true,
        open: false
      },
      livereload: {
        options: {
          files: [
            '<%= config.app %>/{,*/}*.html',
            '.tmp/styles/{,*/}*.css',
            '<%= config.app %>/images/{,*/}*',
            '.tmp/js/{,*/}*.js',
            '<%= config.app %>/js/**/*.js'
          ],
          port: 9001,
          server: {
            baseDir: ['.tmp', '../js/src/', config.app],
            routes: {
              '/bower_components': './bower_components',
              '/js/src': '../js/src'
            }
          }
        }
      },
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        ignores: ['js/3rd-party/**/*.js'],
        force: true // TODO: Remove this once we get files linted correctly!!!
      },
      all: {
        src: [
          'Gruntfile.js',
          'js/{,*/}*.js'
        ]
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/{,*/}*',
            '!dist/.git{,*/}*'
            ]
          }]
        },
      server: '.tmp'
    },
    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          'dist/scripts/{,*/}*.js',
          'dist/css/{,*/}*.css',
          'dist/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'dist/css/fonts/*'
        ]
      }
    },
    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: '<%= config.app %>/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/styles'
        ]
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/styles/{,*/}*.css']
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          // true would impact styles with attribute selectors
          removeRedundantAttributes: false,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },
     // ng-annotate tries to make the code safe for minification automatically
     // by using the Angular long form for dependency injection.
     ngAnnotate: {
       dist: {
         files: [{
           expand: true,
           cwd: '.tmp/concat/scripts',
           src: '*.js',
           dest: '.tmp/concat/scripts'
         }]
       }
     },
     // Copies remaining files to places other tasks can use
     copy: {
       dist: {
         files: [{
           expand: true,
           dot: true,
           cwd: '',
           dest: 'dist',
           src: [
             '*.{ico,png,txt}',
             '*.html',
             'images/{,*/}*.{webp}',
             'css/fonts/{,*/}*.*'
           ]
         }, {
           expand: true,
           cwd: '.tmp/images',
           dest: 'dist/images',
           src: ['generated/*']
         }, {
           expand: true,
           cwd: 'bower_components/bootstrap/dist',
           src: 'fonts/*',
           dest: 'dist'
         }]
       },
       styles: {
         expand: true,
         cwd: '/css',
         dest: '.tmp/css/',
         src: '{,*/}*.css'
       }
     },
     // Run some tasks in parallel to speed up the build process
     concurrent: {
       server: [
         'copy:styles'
       ],
       dist: [
         'copy:styles',
         'imagemin',
         'svgmin'
       ]
     },
  });

  grunt.registerTask('serve', ['clean:server',
      'wiredep',
      'concurrent:server',
      'postcss',
      'includereplace:dev',
      'browserSync:livereload',
      'watch']);
  
  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'postcss',
    'concat',
    'cssmin',
    'ngAnnotate',
    'uglify',
    'copy:dist',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

};