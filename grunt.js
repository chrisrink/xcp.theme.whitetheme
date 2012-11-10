var connect = require('connect');

/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },
    test: {
      files: ['test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint test'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },  
      globals: {}
    },
	compass: {
		dev: {
			src: 'src/test.scss',
			dest: 'gen/css',
			linecomments: true,
			forcecompile: true,
			debugsass: true,
			relativeassets: true
		}
	}

    });

// Redefining the "server" task for this project. Note that the output
// displayed by --help will reflect the new task description.
grunt.registerTask('server2', 'Start a custom static web server.', function() {
  grunt.log.writeln('Starting static web server in "www-root" on port 1234.');
  connect(connect.static('WebContent')).listen(1234);
});

  // Default task.
grunt.registerTask('default', 'server2');
 // grunt.registerTask('default', 'compass:dev');
  
  //todo - Add Phantom rendering comps
   //grunt.registerTask('default', 'lint test compass:dev');





  



};