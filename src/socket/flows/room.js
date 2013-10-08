var _ = require('underscore');
var Room = require('../../models').room;
var UserModel = require('../../models').user;

module.exports = function(server){
  server.sock.when('CREATE /api/rooms', createRoom);
  server.sock.when('READ /api/rooms', readRooms);
  server.sock.when('READ /api/room/:id', readRoom);
  server.sock.when('UPDATE /api/room/:id', updateRoom);
  server.sock.when('DELETE /api/room/:id', deleteRoom);

  server.sock.when('JOIN /api/room/:id', joinRoom);
  server.sock.when('LEAVE /api/room/:id', leaveRoom);

}

function joinRoom(socket, data, next){
  var user = UserModel.user(socket.user);
  user.joinRoom(socket.params['id'], function(err, result){
    if(err){
      return next(err);
    }
    socket.json({result: result});
  });
}

function leaveRoom(socket, data, next){
  //TODO: implement
}

function createRoom(socket, data, next){
  var newRoom = _(data).pick("description", "name");
  newRoom.owner = socket.user._id;

  Room.create(newRoom, function(err, room){
    socket.json(room);
  });
}

function readRooms(socket, data, next){
  //TODO: implement
}

function readRoom(socket, data, next){
  //TODO: implement
}

function updateRoom(socket, data, next){
  //TODO: implement
}

function deleteRoom(socket, data, next){
  //TODO: implement
}
