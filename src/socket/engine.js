var engine = require('engine.io');
var signer = require('secure.me')({salt:nconf.get('security:salt')}).signer({salt:nconf.get('security:salt')});
var eioSession = require('engine.io-session');
var _ = require('underscore');

var socker = require('socker');

var async = require('async');
var UserModel = require('../models').user;
var rooms = require('./rooms.js');

module.exports = function(server){
  var ms = server.ms;
  server = engine.attach(server);
  
  server = rooms(server);
  socker(server);

  server.sock.can = function(premission){
    return function(socket, data, next){
      if(socket.user.premissions && socket.user.premissions[premission]){
        next();
      }
      //TODO: remove when implemented
      return next();
      next("you have no ehough premissions to do that");
    }
  }
  
  server.sock.use(logger);
  server.sock.use(roomsAutojoin);
  /**
   * prepare free middleware
   */
  server.sock.free = server.sock.replaceWith(function(socket, data, next){
    next();
  });

  server.sock.use(function(err, socket, data, next){
    socket.json({
      type: "ERROR",
      err: err,
      data: data});
  });
  server.sock.setDefault(authorization);

  require('./flows/room.js')(server);
  require('./flows/messaging.js')(server);
  require('./flows/user.js')(server);

  server.on('connection', eioSession({
    cookieParser:nconf.get('sessions:parser'),
    store: ms,
    key: 'sid',
    secret: 'secret' 
  }));
  server.on('session', function(socket, session){
    socket.user = session.user;
    socker.attach(socket);

    // TODO: change status of a user to online
    if(socket.user && socket.user.id) UserModel.of(socket.user).goOnline();

    roomsAutojoin(socket, null, function(){
      socket._rooms.forEach(function(roomId){
        socket.to(roomId).sendToActive(JSON.stringify({type: "STATUS", action:"ONLINE", uid: socket.user.id}));
      });
    });
    // TODO: socket on close
    // socket that was closed should find corresponding user and change it's status to offline.
    socket.on('close',function(){ 
      if(socket.user && socket.user.id) UserModel.of(socket.user).goOffline();
      socket._rooms.forEach(function(roomId){
        socket.to(roomId).sendToActive(JSON.stringify({type: "STATUS", action:"OFFLINE", uid: socket.user.id}));
      });
    });
  });
}


/**
 * log incoming socket calls
 */
function logger(socket, data, next){
  console.log(data.type + " : socket msg, user: " + socket.user);
  data.path && console.log(data.path + " - call to path ");
  next();
};
/**
 * join user to rooms if the user is just logged in
 */
function roomsAutojoin(socket, data, next){
  if(_.isEmpty(socket._rooms)){
    if(socket.user && socket.user.rooms){
      socket.user.rooms.forEach(function(room){
        socket.join(room)
      })
    }
  }
  next();
}

/**
 * check authorization
 */
function authorization(socket, data, next){
  if(socket.user) return next();
  return next("Not authorized");
}

