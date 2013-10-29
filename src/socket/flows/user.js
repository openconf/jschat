var _ = require('underscore');
var RoomModel = require('../../models').room;
var UserModel = require('../../models').user;

module.exports = function(server){
  server.sock.when('READ /api/me', readProfile);
  server.sock.when('UPDATE /api/me', updateProfile);
  server.sock.when('DELETE /api/me', deleteProfile);

  server.sock.when('READ /api/users', readUsers);
  server.sock.when('READ /api/user/:id', readUser);
  
  // server.sock.can - implement first
  server.sock.when('UPDATE /api/user/:id', server.sock.can('updateUser'), updateUser);
  server.sock.when('DELETE /api/user/:id', server.sock.can('deleteUser'), deleteUser);
}

function readProfile(socket, data, next){
  if (!socket.user) {
    next('404');
  }
  socket.json(socket.user);
}

function updateProfile(socket, data, next){
  var user = UserModel.user(socket.user);
  user.edit(data, function(err, userUpdated){
    if(err){
      return next(err);
    }
    _.extend(socket.user, userUpdated);
    socket.json(userUpdated);
  });
}

function deleteProfile(socket, data, next) {
  var user = UserModel.user(socket.user);
  user.delete(function(err){
    if(err){
      return next(err);
    }
    delete socket.user;
    socket.json({statusCode: 200});
  });
}

function readUsers(socket, data, next){
  UserModel.getAllUsers(function(err, users) {
    if(err){
      return next(err);
    }
    socket.json({statusCode: 200, users: users});
  });
}

function readUser(socket, data, next){
  UserModel.getById(socket.params['id'], function(err, user){
    if(err) {
      return next(err);
    }
    socket.json(user);
  });
}

function updateUser(socket, data, next) {
  UserModel.updateById(socket.params['id'], data, function(err, user){
    if(err) {
      return next(err);
    }
    socket.json(user);
  });
}

function deleteUser() {

}
