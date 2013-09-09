var rooms = {};
var _ = require('underscore');

module.exports = function(server){
  server.on('connection', function(socket){
    socket.join = joinRoom(socket);
    socket.to = toRoom(socket);
    socket.leave = leaveRoom(socket);
  });
  return server;
}

function joinRoom(socket){
  socket._rooms = [];
  return function(name, cb){
    socket._rooms.push(name);
    if(!rooms[name]) rooms[name] = [];
    rooms[name].push(socket);
  }
}

function leaveRoom(socket){
  return function(name, cb){
    socket._rooms.splice(socket._rooms.indexOf(name), 1);
    _(rooms[name]).find(function(s){
      return s.id == socket.id;
    });
  }
}

function toRoom(socket){
  return function(name){
    return {
      send: sendToRoom(socket, name)
    }
  }
}

function sendToRoom(socket, name){
  return function(msg){
    var  arg = arguments;
    rooms[name].forEach(function(s){
      if(socket.id == s.id) return;
      s.send.apply(s, arg);
    })
  }
}