module.exports = function(grunt){
  grunt.initConfig({
    nodewebkit: {
      options: {
        build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
        mac: true, // We want to build it for mac
        win: true, // We want to build it for win
        linux32: true, // We don't need linux32
        linux64: false, // We don't need linux64
        version: '0.8.2'
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
      }
    }
  });
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('run', function(){
    require("./server.js");
  });

  grunt.registerTask('test', ['run','mochaTest']);
  
  grunt.registerTask('buildapp', ['copy:main','nodewebkit']);

  grunt.registerTask('default', 'test');
}