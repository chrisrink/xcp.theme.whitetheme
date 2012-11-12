var connect = require('connect');
var path = require('path');
var fs = require('fs');
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
      options: {
        src: 'src/white-theme.scss',
        dest: 'app/style/white.css',
        linecomments: true,
        forcecompile: true,
        debugsass: true,
        relativeassets: true
      }
		}
	}

    });

grunt.loadTasks('tasks');


// Redefining the "server" task for this project. Note that the output
// displayed by --help will reflect the new task description.
grunt.registerTask('server2', 'Start a custom static web server.', function() {
    var rootDir = path.resolve('WebContent');
    var done = this.async();
    grunt.log.writeln('Starting static web server in ' + rootDir + ' on port 1234');
    connect()
      .use(connect.static(rootDir))
      .listen(1234)
      .on('close', done);
});


grunt.registerTask('preparecompass', 'compile sass', function() {
  var ignores = ['.gitignore', '.ignore', '.buildignore'];
  var extloc = 'app/js/ext-4.1/resources/themes/stylesheets/ext4';
  var xcploc = 'app/js/resources/themes/stylesheets/xcp';
  grunt.task.helper('copy',
    path.resolve(extloc),
    path.resolve('src/ext4'),
    ignores, function(e) {
      if ( e ) {
        grunt.log.error( e.stack || e.message );
      } else {
        grunt.log.ok( path.resolve( extloc) + ' -> ' + path.resolve( 'src/ext4' ) );
    }
  });

  grunt.task.helper('copy',
    path.resolve(xcploc),
    path.resolve('src/xcp'),
    ignores, function(e) {
      if ( e ) {
        grunt.log.error( e.stack || e.message );
      } else {
        grunt.log.ok( path.resolve( xcploc ) + ' -> ' + path.resolve( 'src/xcp' ) );
    }
  });



  // fs.linkSync(
  //   path.resolve('app/js/ext-4.1/resources/themes/stylesheets/ext4'),
  //   path.resolve('src/ext4'),
  //   'junction'
  // );
  // fs.linkSync(
  //     path.resolve('app/js/resources/themes/stylesheets/xcp'),
  //     path.resolve('src/xcp'),
  //     'junction'
  // );
    // var gen =    // var rootDir = path.resolve('WebContent');
    // var done = this.async();
    // grunt.log.writeln('Starting static web server in ' + rootDir + ' on port 1234');
    // connect()
    //   .use(connect.static(rootDir))
    //   .listen(1234)
    //   .on('close', done);
});



grunt.registerHelper('mkTarget', function(files, opts) {
    // opts = opts || {};
    // fs.mkdirSync(path.resolve('../gen'));
    // files.forEach(function(f){


    // });
    // grunt.file.expandFiles(files).forEach(function(f) {
    //   var md5 = grunt.helper('md5', f),
    //     renamed = [md5.slice(0, 8), path.basename(f)].join('.');

    //   grunt.verbose.ok().ok(md5);
    //   // create the new file
    //   fs.renameSync(f, path.resolve(path.dirname(f), renamed));
    //   grunt.log.write(f + ' ').ok(renamed);
    // });
  });


  // Default task.
grunt.registerTask('default', 'preparecompass compass:dev');
 // grunt.registerTask('default', 'compass:dev');
  
  //todo - Add Phantom rendering comps
   //grunt.registerTask('default', 'lint test compass:dev');





  



};