var Room = require('../../models').room;

module.exports = function(server){
  server.sock.when('CREATE /api/rooms/:id/messages', createMessage, roomBroadcast);
  server.sock.when('READ /api/rooms/:id/messages', readMessages);
  server.sock.when('READ /api/rooms/:id/messages/:mid', readMessage);
  server.sock.when('UPDATE /api/rooms/:id/messages/:mid', updateMessage, roomBroadcast);
  server.sock.when('DELETE /api/rooms/:id/messages/:mid', deleteMessage, roomBroadcast);
}

function createMessage(socket, data, next){
  // user should be a part of a room
  // user should not be banned from room
  //TODO: save message in DB and pass it over to next for broadcasting
  Room.room(socket.params.id).createMessage(data, next);
}
function readMessages(socket, data, next){
  //TODO: read messages from DB 
  //limit em somehow
  Room.room(socket.params.id).getMessages(function(err, messages){
    socket.json(messages);
  });
}

function readMessage(socket, data, next){
  //TODO: read message from DB
  Room.room(socket.params.id).getMessage(function(err, message){
    socket.json(message);
  });
}
function updateMessage(socket, data, next){
  //TODO: premissions:
  // user who srested message
  // user who have premissions in the room
  // user who have global premissions
  //TODO: update message in DB and pass it cmd over to next for broadcasting
  Room.room(socket.params.id).updateMessage(socket.params.mid,  data, function(err, message){
    socket.json(message);
    next();
  });
}

function deleteMessage(socket, data, next){
  //TODO: premissions:
  // user who srested message
  // user who have premissions in the room
  // user who have global premissions
  //TODO: del message in DB and pass cmd over to next for broadcasting
  Room.room(socket.params.id).deleteMessage(socket.params.mid, function(err, message){
    socket.json({"message":"OK"});
    next();
  });
}

function roomBroadcast(socket, data, next){
  //TODO: broadcast cmd to room with id from socket.params['id']
  socket.to(socket.params['id']).send(JSON.stringify(data));
  socket.json({});
}
