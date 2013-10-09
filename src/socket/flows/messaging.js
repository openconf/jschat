module.exports = function(server){
  server.sock.when('CREATE /api/room/:id/messages', createMessage, roomBroadcast);
  server.sock.when('READ /api/room/:id/messages', readMessages);
  server.sock.when('READ /api/room/:id/message/:mid', readMessage);
  server.sock.when('UPDATE /api/room/:id/message/:mid', updateMessage, roomBroadcast);
  server.sock.when('DELETE /api/room/:id/message/:mid', deleteMessage, roomBroadcast);
}

function createMessage(socket, data, next){
  // user should be a part of a room
  // user should not be banned from room
  //TODO: save message in DB and pass it over to next for broadcasting
  next();
}
function readMessages(socket, data, next){
  //TODO: read messages from DB 
  //limit em somehow
}

function readMessage(socket, data, next){
  //TODO: read message from DB
}
function updateMessage(socket, data, next){
  //TODO: premissions:
  // user who srested message
  // user who have premissions in the room
  // user who have global premissions
  //TODO: update message in DB and pass it cmd over to next for broadcasting
}

function deleteMessage(socket, data, next){
  //TODO: premissions:
  // user who srested message
  // user who have premissions in the room
  // user who have global premissions
  //TODO: del message in DB and pass cmd over to next for broadcasting
}

function roomBroadcast(socket, data, next){
  //TODO: broadcast cmd to room with id from socket.params['id']
  socket.to(socket.params['id']).send(JSON.stringify(data));
  socket.json({});
}
