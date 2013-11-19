var backbone = require('exoskeleton');
var socket = require('engine.io')(location.origin.replace(/^http/, 'ws'));
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
