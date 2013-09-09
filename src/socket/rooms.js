var rooms = {};

module.exports = function(server){
  server.on('connection', function(socket){
    socket.join = joinRoom(socket);
    socket.to = toRoom(socket);
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