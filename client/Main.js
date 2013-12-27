var backbone = require('exoskeleton');
var socket = require('engine.io')(window.host.replace(/^http/, 'ws'));
var reconnect = require('engine.io-reconnect');
socket = reconnect(socket, {timeout:86400000});
require('socker-client')(socket);
backbone.socket = socket;
require('bbsocker.sync')(backbone);

var _ = require('underscore');
var app = function(){
}
var started = false;
_.extend(app, backbone.Events);
_.extend(app,{
  router: require('./router.js')(app),
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
  app.trigger('reconnected');
});

backbone.socket.on('reconnecting', function(attempts) {
  console.log('Trying to reconnect after %d attempts', attempts);
  app.trigger('reconnecting');
});

backbone.socket.on('reconnect_error', function(error) {
  console.log('Error trying to reconnect', error);
});

backbone.socket.on('reconnect_timeout', function(timeout) {
  console.log('Timeout after %dms', timeout);
});


module.exports = app;
