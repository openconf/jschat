var _ = require('underscore');
var Room = require('../../models').room;
var UserModel = require('../../models').user;

module.exports = function(server){
  server.sock.when('CREATE /api/rooms', createRoom);
  server.sock.when('READ /api/rooms', readRooms);
  server.sock.when('READ /api/room/:id', readRoom);
  server.sock.when('UPDATE /api/room/:id', server.sock.can('updateRoom'), updateRoom);
  server.sock.when('DELETE /api/room/:id', server.sock.can('deleteRoom'), deleteRoom);
  server.sock.when('JOIN /api/room/:id', joinRoom);
  server.sock.when('LEAVE /api/room/:id', leaveRoom);
}

function joinRoom(socket, data, next){
  var user = UserModel.user(socket.user);
  user.joinRoom(socket.params['id'], function(err, result){
    if(err){
      return next(err);
    }
    socket.join(socket.params['id']);
    socket.json({result: result});
  });
}

function leaveRoom(socket, data, next){
  //TODO: implement
  // remove from DB
  //remove from socket
}

function createRoom(socket, data){
  var newRoom = _(data).pick("description", "name");
  newRoom.owner = socket.user._id;

  Room.create(newRoom, function(err, room, next){
    if(err){
      return next(err);
    }
    socket.json(room);
  });
}

function readRooms(socket, data, next){
  Room.getAll(socket.user._id, function(err, rooms, next) {
    if(err){
      return next(err);
    }
    socket.json({statusCode: 200, rooms: rooms});
  });
}

function readRoom(socket){
  Room.getById(socket.params['id'], function(err, room, next){
    if(err){
      return next(err);
    }
    room ? socket.json(room) : socket.json({err: 'Room not found', statusCode: 404});
  });
}

function updateRoom(socket, data, next){
  var updatedRoom = _(data).pick("description", "name");
  updatedRoom.owner = socket.user._id;

  Room.updateById(socket.params['id'], updatedRoom, function(err, room){
    if(err){
      return next(err);
    }
    socket.json(room);
  });
}

function deleteRoom(socket, data, next){
  Room.deleteById(socket.params['id'], function(err){
    if(err){
      return next(err);
    }
    socket.json({statusCode: 200});
  });
}
