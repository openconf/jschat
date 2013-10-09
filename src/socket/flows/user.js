module.exports = function(server){
  server.sock.when('READ /api/me', readProfile);
  server.sock.when('UPDATE /api/me', updateProfile);

  server.sock.when('READ /api/users', readUsers);
  server.sock.when('READ /api/user/:id', readUser);
  
  // server.sock.can - implement first
  //server.sock.when('UPDATE /api/user/:id', server.sock.can('updateUser'), updateUser);
  //server.sock.when('DELETE /api/user/:id', server.sock.can('deleteUser'), deleteUser);
}

function readProfile(socket, data, next){
  socket.json(socket.user);
}

function updateProfile(socket, data, next){
  //TODO: implement
}

function readUsers(socket, data, next){
  //TODO: implement
}

function readUser(socket, data, next){
  //TODO: implement
}
