var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('../socketClientPatched');
var sockerClient = require('socker').client;
var async = require('async');
var _ = require('underscore');

users = [{
  name: "User1",
  id: 100
},
{
  name: "User2",
  id: 101
},
{
  name: "User3",
  id: 102
},
{
  name: "UserAdmin",
  id: 103
}]


before(function(done){
  utils.useCollections(['user', 'room'], function(){
    utils.clean("user", done);
  })
});

/**
 * A new suite for testing rooms handling logic, based on sockets
 */
describe("authenticate user with permissions", function(){

  var sockets = [];

  beforeEach(function(done){
    utils.clean(function(){
      async.eachSeries(users, function(user, next){
        var jar = utils.authenticate(user, function(){
          var socket = eio('ws://' + nconf.get("server:hostname"),{
              transports:['websocket'],
              header:{"Cookie":jar.cookies[0].str}
            });
          sockerClient(socket);
          sockets.push(socket);
          next()
        });
      }, function(err) {
        expect(err).to.be.not.ok;
        done();
      });
    })

  });

  it('All users are authorized and established their socket connections', function() {
    expect(sockets).to.have.length(users.length);
  });

  describe("READ /api/me should return user profile", function(){

    var userProfiles = [];

    before(function(done){
      async.eachSeries(sockets, function(socket, next) {
        socket.serve('READ /api/me', function(err, data) {
          userProfiles.push(data);
          next(err);
        });
      }, function(err){
        expect(err).to.be.not.ok;
        done();
      });
    });

    it('User name/id should be the same', function(){
      for (var i = 0, l = users.length; i < l; i++) {
        var user = users[i],
            userProfile = userProfiles[i].github;
        expect(userProfile).to.have.property('displayName', user.name);
        expect(userProfile).to.have.property('id', user.id);
      }
    });



    describe("READ /api/users get all users", function(){

      var gotUsers, socket;

      before(function(done){
        socket = sockets[0];
        socket.serve('READ /api/users', function(err, data){
          expect(err).to.be.not.ok;
          gotUsers = data.users;
          done();
        });
      });

      it('It should return right number of results', function(){
        expect(gotUsers).to.have.length(userProfiles.length);
      });

      it('names should be the same', function(){
        var names = _(_(gotUsers).pluck('github')).pluck('displayName');
        expect(_.difference(names, _(_(userProfiles).pluck('github')).pluck('displayName'))).to.be.empty;
      });

    });

    describe("PUT /api/me should edit self", function(){

      var socket,
          user,
          newName = 'newName',
          updatedUser;

      before(function(done){

        user = userProfiles[0];
        socket = sockets[0];

        _.extend(user.github, {displayName: newName});

        socket.serve('UPDATE /api/me', user, function(err, data){
          expect(err).to.be.not.ok;
          socket.serve('READ /api/me', function(err, data){
            expect(err).to.be.not.ok;
            updatedUser = data;
            done();
          });
        });

      });

      it('Updated user should have same _id', function(){
        expect(updatedUser).to.have.property('_id', user._id);
      });

      it('Updated user should have new name', function(){
        expect(updatedUser.github).to.have.property('displayName', newName);
      });

    });

    //TODO: Clarify and implement a proper work out
    xdescribe("DELETE /api/me should delete self", function(){

      var statusCode,
          socket;

      before(function(done){
        socket = sockets[0];
        socket.serve('DELETE /api/me', function(err, data){

          expect(err).to.be.not.ok;
          expect(data).to.have.property("statusCode", 200);

          socket.serve('READ /api/me', function(err){
            expect(err).to.be.ok;
            statusCode = err;
            done();
          });

        });
      });

      it('the user should not exist anymore thus statusCode should be 404', function(){
        expect(statusCode).to.equal(404);
      });

    });


    xdescribe("READ /api/user/:id user should be able to get user info by Id", function(){

      var gotUser, socket;

      before(function(done){
        socket = sockets[0];
        socket.serve('READ /api/user/' + userProfiles[3]._id, null, function(err, data){
          expect(err).to.be.not.ok;
          gotUser = data;
          done();
        });
      });

      it('returned gotUser should have props from user[3]', function(){
        expect(gotUser.github).to.have.property('displayName', userProfiles[3].github.displayName);
        expect(gotUser).to.have.property('_id', userProfiles[3]._id);
      });

    });

    xdescribe("PUT /api/users/:id should edit user", function(){

      var newName = 'A Very New Name',
          gotUser, socket, user;

      before(function(done){
        socket = sockets[0];
        user = userProfiles[3];
        _.extend(user.github, {displayName: newName});
        socket.serve('UPDATE /api/user/' + user._id, user, function(err){
          expect(err).to.be.not.ok;
          socket.serve('READ /api/user/' + user._id, function(err, data){
            expect(err).to.be.not.ok;
            gotUser = data;
            done();
          });
        });
      });

      it('returned gotUser should have new name', function(){
        expect(gotUser.github).to.have.property('displayName', newName);
      });

    });

    //TODO: Clarify and implement a proper work out
    xdescribe("DELETE /api/users/:id user should delete the user", function(){

      var statusCode, socket, user;

      before(function(done){
        user = userProfiles[3];
        socket = sockets[0];
        socket.serve('DELETE /api/me' + user._id, function(err, data){

          expect(err).to.be.not.ok;
          expect(data).to.have.property("statusCode", 200);

          socket.serve('READ /api/users/' + user._id, function(err){
            expect(err).to.be.ok;
            statusCode = err;
            done();
          });

        });
      });

      it('the user should not exist anymore thus statusCode should be 404', function(){
        expect(statusCode).to.equal(404);
      });

    });

  });

});