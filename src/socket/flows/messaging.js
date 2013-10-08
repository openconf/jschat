module.exports = function(server){
  server.sock.when('CREATE /api/room/:id/messages', createMessage, roomBroadcast);
  server.sock.when('READ /api/room/:id/messages', readMessages);
  server.sock.when('READ /api/room/:id/message/:mid', readMessage);
  server.sock.when('UPDATE /api/room/:id/message/:mid', updateMessage, roomBroadcast);
  server.sock.when('DELETE /api/room/:id/message/:mid', deleteMessage, roomBroadcast);
}

function createMessage(socket, data, next){
  //TODO: save message in DB and pass it over to next for broadcasting
}
function readMessages(socket, data, next){
  //TODO: read messages from DB 
  //limit em somehow
}

function readMessage(socket, data, next){
  //TODO: read message from DB
}
function updateMessage(socket, data, next){
  //TODO: update message in DB and pass it cmd over to next for broadcasting
}

function deleteMessage(socket, data, next){
  //TODO: del message in DB and pass cmd over to next for broadcasting
}

function roomBroadcast(socket, data, next){
  //TODO: broadcast cmd to room with id from socket.params['id']
}
