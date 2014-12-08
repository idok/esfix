'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['tasks/**/*.js', '!tasks/lib/wix-package/**/*.js', '!tasks/lib/data/**/*.js']
            },
            teamcity: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: 'checkstyle',
                    reporterOutput: 'target/jshint.xml'
                },
                src: ['<%= jshint.all.src %>']
            }
        },
        eslint: {
            options: {
                rulesdir: ['conf/rules']
            },
            all: ['test/src/**/*.js', 'tasks/**/*.js', '!tasks/lib/wix-package/**/*.js', '!tasks/lib/data/**/*.js'],
            teamcity: {
                options: {
                    format: 'checkstyle',
                    'output-file': 'target/eslint.xml'
                },
                src: ['<%= eslint.all %>']
            }
        },
//        jscs: {
//            src: ['<%= eslint.all %>']
//        },
        /*eslint camelcase:0*/
        // jscs:disable
        jasmine_node: {
        // jscs:enable
            coverage: {},
            options: {
                forceExit: true,
                match: '.',
                matchall: true, // load only specs containing specNameMatcher (was false)
                specNameMatcher: 'spec',
                extensions: 'js'
            },
            all: ['test/src/'],
            teamcity: {
                options: {
                    showColors: false,
                    teamcity: true,
                    jUnit: {
                        report: true,
                        savePath: './target/surefire-reports/',
                        useDotNotation: true,
                        consolidate: true
                    }
                },
                src: ['<%= jasmine_node.all %>']
            }
//        },
//        teamcity: {
//            options: {
//                // Task-specific options go here.
//            },
//            all: {}
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/src/**/*.js']
            }
        },
        jsonlint: {
            all: {
                src: ['tasks/**/*.json']
            }
        }
    });

//    grunt.task.loadTasks('./internalTasks');
//    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-jsonlint');
//    grunt.loadNpmTasks('grunt-jasmine-node-coverage');
//    grunt.loadNpmTasks('grunt-mocha-test');
//    grunt.loadNpmTasks('grunt-mocha');
//    grunt.loadNpmTasks('grunt-teamcity');

    grunt.registerTask('verify', ['jshint:all', 'eslint:all', 'jsonlint']);
    grunt.registerTask('default', ['verify', 'jasmine_node:all']);
    grunt.registerTask('test', ['jasmine_node:all']);
    grunt.registerTask('teamcity-build', ['eslint:teamcity']); /* 'jshint:teamcity', */
    grunt.registerTask('teamcity-test', ['jasmine_node:teamcity']);
};
