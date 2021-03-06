'use strict';

var paths = {
    js: ['*.js', 'packages/**/*.js', 'test/**/*.js', '!test/coverage/**', '!bower_components/**',
         '!packages/**/node_modules/**', '!packages/contrib/**', '!packages/**/vendor/**', '!packages/**/tests/**', '!test/**'],
    html: ['packages/**/public/**/views/**', 'packages/**/server/views/**'],
    css: ['!bower_components/**', 'packages/**/public/**/css/*.css', '!packages/contrib/**/public/**/css/*.css',
          '!packages/articles/public/assets/vendor/**', '!packages/system/public/assets/css/*.css']
};

module.exports = function (grunt) {

    if (process.env.NODE_ENV !== 'production') {
        require('time-grunt')(grunt);
    }

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        assets: grunt.file.readJSON('config/assets.json'),
        clean: ['bower_components/build'],
        watch: {
            js: {
                files: paths.js,
                tasks: ['jshint'],
                options: {
                    livereload: true
                    //interval: 1000
                }
            },
            html: {
                files: paths.html,
                options: {
                    livereload: true,
                    interval: 1000
                }
            },
            css: {
                files: paths.css,
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            }
            //coffee: {
            //    files: paths.coffee,
            //    tasks: ['coffee:compile']
            //}
        },
        //coffee: {
        //    compile: {
        //        expand: true,
        //        bare: true,
        //        flatten: false,
        //        force: true,
        //        // Need to change this to whatever makes sense
        //        cwd: __dirname + '/packages',
        //        dest: __dirname + '/packages',
        //        src: paths.coffee,
        //        ext: '.js'
        //    }
        //},
        jshint: {
            all: {
                src: paths.js,
                options: {
                    jshintrc: true
                }
            }
        },
        uglify: {
            core: {
                options: {
                    mangle: false
                },
                files: '<%= assets.core.js %>'
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            src: paths.css
        },
        cssmin: {
            core: {
                files: '<%= assets.core.css %>'
            }
        },
        copy: {
            main: {
                //files: '<%= assets.core.fonts %>'
                files: [
                    {
                        expand: true,
                        src: ['bower_components/font-awesome/fonts/fontawesome-webfont.woff'],
                        dest: 'bower_components/build/fonts/',
                        //cwd: '.'
                        flatten: true
                    }
                ]
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: [],
                    ignore: ['node_modules/**'],
                    ext: 'js,html',
                    nodeArgs: ['--debug'],
                    delayTime: 1,
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }, // Testing framework
        mochaTest: {
            options: {
                reporter: 'spec',
                require: [
                    'server.js',
                    //'bower_components/angular-mocks/angular-mocks.js',
                    function () {
                        require('meanio/lib/util').preload(__dirname + '/packages/**/server', 'model');
                    }
                ],
                log: true
            },
            src: ['packages/**/server/tests/**/*.js']
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        // Unit tests
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        // e2e test
        // Run individual tests like this: grunt e2e --specs=packages/users/public/tests/e2e/users.js
        protractor: {
            options: {
                configFile: 'protractorConf.js', // Default config file
                keepAlive: true, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                args: {
                    // Arguments passed to the command
                },
                debug: false
            },
            all: {}
            //your_target: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
            //    options: {
            //        configFile: "e2e.conf.js", // Target-specific config file
            //        args: {} // Target-specific arguments
            //    }
            //}
        }
    });

    //Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //Default task(s).
    if (process.env.NODE_ENV === 'production') {
        // Run and monitoring is done by pm2, not concurrent
        grunt.registerTask('default', ['clean', 'copy', 'cssmin', 'uglify']);
    } else {
        grunt.registerTask('default', ['clean', 'jshint', 'csslint', 'concurrent']);
    }

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit', 'protractor']);
    grunt.registerTask('mocha', ['env:test', 'mochaTest']);
    grunt.registerTask('karmatest', ['env:test', 'karma:unit']);
    grunt.registerTask('e2e', ['env:test', 'mochaTest', 'protractor']);

    // For Heroku users only.
    // Docs: https://github.com/linnovate/mean/wiki/Deploying-on-Heroku
    //grunt.registerTask('heroku:production', ['cssmin', 'uglify']);
};
