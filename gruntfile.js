module.exports = function(grunt){
  grunt.initConfig({
    mochaTest:{
      integration:{
        options:{
          reporter:"spec"
        },
        src: ["tests/**/chat.rooms.spec.js"]
      }
    }
  });
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('run', function(){
    require("./server.js");
  });
  
  grunt.registerTask('test', ['run','mochaTest']);

  grunt.registerTask('default', 'test');
}