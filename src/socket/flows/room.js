module.exports = function(server){
  server.sock.when('CREATE /api/room', createRoom);
  server.sock.when('READ /api/rooms', readRooms);
  server.sock.when('READ /api/room/:id', readRoom);
  server.sock.when('UPDATE /api/room/:id', updateRoom);
  server.sock.when('DELETE /api/room/:id', deleteRoom);

  server.sock.when('JOIN /api/room/:id', joinRoom);
  server.sock.when('LEAVE /api/room/:id', leaveRoom);

}

function joinRoom(socket, data, next){
  //TODO: implement
}

function leaveRoom(socket, data, next){
  //TODO: implement
}

function createRoom(socket, data, next){
  //TODO: implement
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
