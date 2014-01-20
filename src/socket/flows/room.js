var _ = require('underscore');
var Room = require('../../models').room;
var UserModel = require('../../models').user;

module.exports = function(server){
  server.sock.when('CREATE /api/rooms', createRoom);
  //is returning last 6 active chats
  server.sock.when('READ /api/rooms', server.sock.free, readRooms);
  server.sock.when('SWITCHTO /api/rooms/:id', switchToRoom);
  //  server.sock.when('READ /api/roomsbyowner/', readRoomsByOwner);
  server.sock.when('READ /api/rooms/:id', readRoom);
  server.sock.when('UPDATE /api/rooms/:id', server.sock.can('updateRoom'), updateRoom);
  server.sock.when('DELETE /api/rooms/:id', server.sock.can('deleteRoom'), deleteRoom);
  server.sock.when('JOIN /api/rooms/:id', joinRoom, broadcastJoin);
  server.sock.when('LEAVE /api/rooms/:id', leaveRoom, broadcastLeave);
}

function switchToRoom(socket, data, next){
  socket.__proto__.__activeRoom = socket.params['id'];
  socket.json({});
}

function joinRoom(socket, data, next){
  var user = UserModel.of(socket.user);
  user.joinRoom(socket.params['id'], userUpdated);
  function userUpdated(err, result){
    if(err){
      return next(err);
    }
    Room.users(socket.user).join(socket.params['id'], roomUpdated);
  }
  function roomUpdated(err, result){
    if(err){
      return next(err);
    }
    socket.join(socket.params['id']);
    socket.json(result);
    next();
  };
}

function broadcastJoin(socket, data, next){
  socket.to(socket.params['id']).send(JSON.stringify({
    type: "ROOM_STATUS",
    rid: socket.params['id'],
    uid: socket.user.id,
    text: "joined...",
    action: "JOIN"
  }));
}

function leaveRoom(socket, data, next){
  //TODO: implement
  // remove from DB
  //remove from socket
  var user = UserModel.of(socket.user);
  user.leaveRoom(socket.params['id'], userUpdated);

  function userUpdated(err, result){
    if(err){
      return next(err);
    }
    Room.users(socket.user).leave(socket.params['id'], roomUpdated);
  }
  
  function roomUpdated(err, result){
    if(err){
      return next(err);
    }
    socket.leave(socket.params['id']);
    socket.json(result);
    next();
  };
}
function broadcastLeave(socket, data, next){
  socket.to(socket.params['id']).send(JSON.stringify({
    type: "ROOM_STATUS",
    rid: socket.params['id'],
    uid: socket.user.id,
    text: "left...",
    action: "LEAVE"
  }));
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
  Room.getLastActive(gotLastActive);
  
  function gotLastActive(err, results){
    Room.get({ids: results}, function(err, rooms) {
      if(err){
        return next(err);
      }
      socket.json(rooms);
    });
  }
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
    if(room) {
      Room.users().get(room.id, function(err, users){
        room.users = users;
        socket.json(room);
      });
    } else {
      socket.json({err: 'Room not found', statusCode: 404});
    }
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
