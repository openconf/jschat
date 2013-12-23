var backbone = require('exoskeleton');
var socket = require('engine.io')(location.origin.replace(/^http/, 'ws'));
var reconnect = require('engine.io-reconnect');
socket = reconnect(socket);
require('socker-client')(socket);
backbone.socket = socket;
require('bbsocker.sync')(backbone);

var _ = require('underscore');
var app = function(){
}
var started = false;
_.extend(app,{
  router: require('./router.js'),
  run: function () {
    backbone.history.start({
      pushState: false,
      root: '/'
    });
    started = true;
  }
});
backbone.socket.onopen = function(){
  if(!started) app.run();
}

backbone.socket.on('reconnect', function(attempts) {
    console.log('Reconnected after %d attempts', attempts);
});

backbone.socket.on('reconnecting', function(attempts) {
    console.log('Trying to reconnect after %d attempts', attempts);
});

backbone.socket.on('reconnect_error', function(error) {
    console.log('Error trying to reconnect', error);
});

backbone.socket.on('reconnect_timeout', function(timeout) {
    console.log('Timeout after %dms', timeout);
});


module.exports = app;
