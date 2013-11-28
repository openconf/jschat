var _ = require('underscore');
var Room = require('../../models').room;
var UserModel = require('../../models').user;
var mongojs = require('mongojs');

module.exports = function(server){
  server.sock.when('CREATE /api/rooms', createRoom);
  server.sock.when('READ /api/rooms', server.sock.free, readRooms);
  server.sock.when('READ /api/roomsbyowner/', readRoomsByOwner);
  server.sock.when('READ /api/rooms/:id', readRoom);
  server.sock.when('UPDATE /api/rooms/:id', server.sock.can('updateRoom'), updateRoom);
  server.sock.when('DELETE /api/rooms/:id', server.sock.can('deleteRoom'), deleteRoom);
  server.sock.when('JOIN /api/rooms/:id', joinRoom);
  server.sock.when('LEAVE /api/rooms/:id', leaveRoom);
}

function joinRoom(socket, data, next){
  var user = UserModel.of(socket.user);
  user.joinRoom(socket.params['id'], userUpdated);
  function userUpdated(err, result){
    if(err){
      return next(err);
    }
    Room.join(socket.params['id'], socket.user._id, roomUpdated);
  }
  function roomUpdated(err, result){
    if(err){
      return next(err);
    }
    socket.join(socket.params['id']);
    socket.json({result: result});
  };
}

function leaveRoom(socket, data, next){
  //TODO: implement
  // remove from DB
  //remove from socket
  var user = UserModel.user(socket.user);
  user.leaveRoom(socket.params['id'], userUpdated);

  function userUpdated(err, result){
    if(err){
      return next(err);
    }
    Room.leave(socket.params['id'], socket.user._id, roomUpdated);
  }
  
  function roomUpdated(err, result){
    if(err){
      return next(err);
    }
    socket.leave(socket.params['id']);
    socket.json({result: result});
  };
}

function createRoom(socket, data, next){
  var newRoom = _(data).pick("description", "name");
  newRoom.owner = socket.user.id;

  Room.create(newRoom, function(err, id){
    if(err){
      return next(err);
    }
    socket.json(id);
  });
}

function readRooms(socket, data, next){
  Room.get(data, function(err, rooms) {
    if(err){
      return next(err);
    }
    socket.json(rooms);
  });
}

function readRoomsByOwner(socket, data,next) {
  Room.getByOwnerId(socket.user._id, function(err, rooms) {
    if(err){
      return next(err);
    }
    socket.json({statusCode: 200, rooms: rooms});
  });
}

function readRoom(socket, data, next){
  Room.getById(socket.params['id'], function(err, room){
    if(err){
      return next(err);
    }
    room ? socket.json(room) : socket.json({err: 'Room not found', statusCode: 404});
  });
}

function updateRoom(socket, data, next){
  var updatedRoom = _(data).pick("description", "name");
  updatedRoom.owner = socket.user._id;

  Room.update(socket.params['id'], updatedRoom, function(err, room){
    if(err){
      return next(err);
    }
    socket.json(room);
  });
}

function deleteRoom(socket, data, next){
  Room.del(socket.params['id'], function(err, removed){
    if(err && removed == 1){
      return next(err || "No room key "+ socket.params['id'] +" found");
    }
    socket.json({statusCode: 200});
  });
}
