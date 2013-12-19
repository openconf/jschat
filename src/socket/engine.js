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


/*
function statusMsg(socket, data, next){
  //TODO: think about statuses and possibly depricate.
  // reasoning: 
  // usually you do not need instant status of a user. You always can just pool for a status
  //of those users that are displayed right now [ /api/users?_id=1,2,3,4&slice=status or smth like this]
  // on a frontend statuses coud cache themselves, expire in 2-3 sec and pool only those that displayed
  //change status of user, broadcast it (online, offline, away, dnd)
  //handle offline somehow
  //save all states to a user collection
  next();
}





function scopeMsgData(socket, data, next){
  // room Id's
  if(data.r) {
    // check if room/s
    scopeData(socket, data);
  }
  // user Id's
  if(data.u) {
    // if this is a set of users (private room), broadcast message to those users
    // to do this - use common emitter where guys will listen to messages adressed to them
  }

  // what to do if there is no scope??
  next();
}


// rooms:
//  _id:
//  description
//  public_id
//  [users]

function sysMsg(socket, data, next){
  if(data.t == "sys"){
    var user = UserModel.user(socket.user);
    if(data.m == "joinRoom"){
      socket.join(data.r.toString(), function(){
        console.log(arguments);
      });
      user.joinRoom(data.r, function(err){
        !err && console.log("user " + socket.user._id + " joined room " + data.r);
        err && console.log(err);
      })
    }
  }
  // join room (put in user the room, and put in room the user)
  next();
}

function writingStatus(socket, data, next){
  //broadcast writing message
  //send writing message once per second
  //do not send it to offline/away guys (think about it)
  next();
}

function message(socket, data, next){
  //broadcast simple message to scope
  console.log("sendind data");
  data.send && data.send();
  next();
}

function saveMessageInDB(socket, data, next){
  // message datastructure:
  //  _id     - timestamp/id
  //  text    - raw text
  //  userId  - user id that sended it
  //  repl    - id of message that was replied
  // additional info that is not saved
  //  lat/lng - position of a guy
  //  mentions- array of id's that were mentioned
  //  hashes  - hashes that were mentioned in message
  //  links   - links that were mentioned in message
  //  room    - roomID

  // save in DB, emit error if saving failed
}

function handleErrors( err,data, socket){
  //socket.send(JSON.stringify(data));
  console.log(err);
}*/
