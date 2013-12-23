var Message = require('../../models').message;
var Room = require('../../models').room;

module.exports = function(server){
  server.sock.when('CREATE /api/rooms/:id/messages', createMessage, roomBroadcast);
  server.sock.when('READ /api/rooms/:id/messages', readMessages);
  server.sock.when('READ /api/rooms/:id/messages/:mid', readMessage);
  server.sock.when('UPDATE /api/rooms/:id/messages/:mid', updateMessage, roomBroadcast);
  server.sock.when('DELETE /api/rooms/:id/messages/:mid', deleteMessage, roomBroadcast);
  server.sock.when('WRITING /api/rooms/:id/messages', writingMessage, roomBroadcast);
}

function writingMessage(socket, data, next){
  data.uid = socket.user.id;
  data.type = "WRITING";
  data.rid = socket.params.id;
  next();
}

function createMessage(socket, data, next){
  // user should be a part of a Message
  // user should not be banned from Message
  //TODO: save message in DB and pass it over to next for broadcasting
  data.uid = socket.user.id;
  Message.room({id:socket.params.id}).create(data, messageCreated);
  function messageCreated(err, id){
    if(err) return next(err);
    data.id = id;
    data.rid = socket.params.id;
    Room.setLastActive(socket.params.id, data.tms, next);
  }
}
function readMessages(socket, data, next){
  //TODO: read messages from DB 
  //limit em somehow
  Message.room({id:socket.params.id}).get(data, function(err, messages){
    socket.json(messages);
  });
}

function readMessage(socket, data, next){
  //TODO: read message from DB
  Message.room({id:socket.params.id}).getById(socket.params.mid, function(err, message){
    socket.json(message);
  });
}
function updateMessage(socket, data, next){
  //TODO: premissions:
  // user who srested message
  // user who have premissions in the Message
  // user who have global premissions
  //TODO: update message in DB and pass it cmd over to next for broadcasting
  Message.room({id:socket.params.id}).update(socket.params.mid,  data, function(err, message){
    socket.json(message);
    next();
  });
}

function deleteMessage(socket, data, next){
  //TODO: premissions:
  // user who srested message
  // user who have premissions in the Message
  // user who have global premissions
  //TODO: del message in DB and pass cmd over to next for broadcasting
  Message.room({id:socket.params.id}).del(socket.params.mid, function(err, message){
    socket.json({"message":"OK"});
    next();
  });
}

function roomBroadcast(socket, data, next){
  //TODO: broadcast cmd to Message with id from socket.params['id']
  if(data.type !== "WRITING") {
    socket.to(socket.params['id']).send(JSON.stringify(data));
  } else {
    socket.to(socket.params['id']).sendToActive(JSON.stringify(data));
  }
  socket.json(data);
}
