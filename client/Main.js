var backbone = require('exoskeleton');
var socket = require('engine.io')('ws://127.0.0.1:8080');
require('socker-client')(socket);
backbone.socket = socket;
require('bbsocker.sync')(backbone);

var _ = require('underscore');
var app = function(){
}

_.extend(app,{
  router: require('./router.js'),
  run: function () {
    backbone.history.start({
      pushState: false,
      root: '/'
    });
  }
});
backbone.socket.onopen = function(){
  app.run();
}
module.exports = app;
