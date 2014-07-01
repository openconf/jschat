var APP_ENV = process.env.APP_ENV || 'development';
var exec = require('child_process').exec;

nconf = require('nconf');
nconf.argv()
     .env()
     .file({ file: __dirname + '/config/' + APP_ENV + '.config.json' });

nconf.set("server:port", nconf.get("server:port") || process.env.PORT);
nconf.set("server:hostname", nconf.get("server:port")?nconf.get("server:host") + ":" +  nconf.get("server:port") : nconf.get("host"));


var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
var is32 = process.arch == 'ia32';
var is64 = process.arch == 'x64';

var dest = "./desktop"

module.exports = function(grunt){
  grunt.initConfig({
    compress:{
      win:{
        options: {
          mode: 'zip',
	  archive: dest + '/releases/JSChat/win/JSChat.zip'
	},
	expand: true,
	cwd: dest + '/releases/JSChat/win/JSChat',
	src: ['**/**'],
	dest: '/JSChat'
      },
      linux32:{
	options: {
	  mode: 'tgz',
	  archive: dest + '/releases/JSChat/linux32/JSChat.tar.gz'
        },
        expand: true,
	cwd: dest + '/releases/JSChat/linux32/JSChat',
	src: ['**/**'],
	dest: 'JSChat/'
      },
      linux64:{
        options: {
          mode: 'tgz',
	  archive: dest + '/releases/JSChat/linux64/JSChat.tar.gz'
        },
        expand: true,
	cwd: dest + '/releases/JSChat/linux64/JSChat',
	src: ['**/**'],
	dest: 'JSChat/'
      }
    },
    nodewebkit: {
      options: {
	build_dir: dest, // Where the build version of my node-webkit app is saved
        mac: true, // We want to build it for mac
        win: true, // We want to build it for win
        linux32: true, // We don't need linux32
	linux64: true, // We don't need linux64
	version: '0.9.2',
        toolbar: false,
        frame: false
      },
      src: ['./webapp/**/*'] // Your node-wekit app
    },
    copy:{
      main:{
        src: "./client/package.json",
        dest: "./webapp/package.json"
      }
    },
    mochaTest:{
      integration:{
        options:{
          reporter:"spec"
        },
        src: ["tests/**/**.spec.js"]
      },
      tag:{
        options:{
          reporter:"spec",
          grep: "<%= grunt.option('tag') %>"
        },
        src: ["tests/**/**.spec.js"]
      }
    }
  });
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  
  grunt.registerTask('run', function(){
    require("./server.js");
  });

  grunt.registerTask('packageMac', function(){
    var done = this.async();
    console.log('packaging...', 'hdiutil create -format UDZO -srcfolder ' + dest + '/releases/JSChat/mac/JSChat.app ' + dest + '/releases/JSChat/mac/JSChat.dmg');

    exec('hdiutil create -format UDZO -srcfolder ' + dest + '/releases/JSChat/mac/JSChat.app ' + dest + '/releases/JSChat/mac/JSChat.dmg',function(error, stdout, stderr){
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      done()
    })
  })

  grunt.registerTask('tagged', function(tag){
    if (!tag) {
      grunt.log.errorlns('Nothing to grep. Running regular integration.')
      return grunt.task.run('test')
    }
    grunt.option('tag', tag)
    return grunt.task.run(['run','mochaTest:tag'])
  })

  grunt.registerTask('index-processing', function(){
    var index = grunt.file.read('./webapp/index.html');
    index = index.replace('//REAL HOST', 'window.host = "http://' + nconf.get('server:hostname') + '" //generted by index-processing');
    grunt.file.write('./webapp/index.html', index);
    return;
  })
 
  
  grunt.registerTask('test', ['run','mochaTest:integration']);
  
  grunt.registerTask('buildapp', ['copy:main','index-processing','nodewebkit']);

  grunt.registerTask('default', 'test');

  // build app
  // compile client
  // serve server
  // watch changes

}