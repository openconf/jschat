var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('engine.io-client');
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
 * A deprecated suite for legacy REST-based API
 * an identical socket-based suite is below...
 */
xdescribe("authenticate user with premissions", function(){
  var u;
  //put 3 users and authenticate admin
  before(function(done){
    async.each(users, function(user, next){
      return utils.authenticate(user, next);
    }, function(err, res){
      u = res;
      done();
    });
  })
//get profile by /api/me
  xdescribe("GET /api/me should return user profile", function(){
    var gotUser;
    before(function(done){
      request.get(utils.url('/api/me'), {jar: u[1] }, gotU1);
      function gotU1(err, req, body){
        gotUser = JSON.parse(body);
        done();
      }
    })
    it('the name/id should be same', function(){
      expect(gotUser).to.have.property('name', users[1].name);
      expect(gotUser).to.have.property('id', users[1].id);
    });
  })


  //edit self profile by PUT /api/me if user is /me
  xdescribe("PUT /api/me should edit self", function(){
    var gotUser;
    before(function(done){
      request.get(utils.url('/api/me'), {jar: u[1] }, gotU1);
      function gotU1(err, req, body){
        var user2 = JSON.parse(body);
        request.put(utils.url('/api/me'), {jar: u[1], form:{name:"MyNewName"} },function(err, request, body){
          expect(request).to.have.property("statusCode", 200);
          gotUser = JSON.parse(body);
          done();
        })
      }
    })
    it('returned gotUser should have new name', function(){
      expect(gotUser).to.have.property('name', "MyNewName");
    });
  })


  //delete profile by DELETE /api/me if user is /me
  xdescribe("DELETE /api/me  should delete self", function(){
    var statusCode;
    before(function(done){
      request.get(utils.url('/api/me'), {jar: u[1] }, gotU1);

      function gotU1(err, req, body){
        var user2 = JSON.parse(body);
        
        request.del(utils.url('/api/me'), {jar: u[1]},function(err, req, body){
          expect(req).to.have.property("statusCode", 200);
          request.get(utils.url('/api/users/' + user2._id), {jar: u[3]},function(err, req, body){
            statusCode = req.statusCode;
            u[1] = utils.authenticate(user, done);
          })
        })
      }
    })
    it('the user should not exist anymore thus statusCode should be 404', function(){
      expect(statusCode).to.equal(404);
    });
  });


  //get all users by GET /api/users
  xdescribe("GET /api/users get all users", function(){
    var gotUsers;
    before(function(){
      request.get(utils.url('/api/users/'), {jar: u[3]},function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        gotUsers = JSON.parse(body);
        done();
      })
    });
    it('It should return right number of results', function(){
      expect(gotUsers).to.have.length(userss.length);
    })
    it('names should be the same', function(){
      var names = _(gotUsers).pluck('name');
      expect(_.difference(names, _(users).pluck('name'))).to.be.empty;
    })
  });



  
  //get specific user info by id GET /api/users/:id
  xdescribe("GET /api/users/:id user should be able to get user info by Id", function(){
    var gotUser;
    before(function(done){
      request.get(utils.url('/api/me'), {jar: u[3] }, gotMe);

      function gotMe(err, req, body){
        var admin = JSON.parse(body);
        request.get(utils.url('/api/users/' + admin._id), {jar: u[3] },function(err, request, body){
          expect(request).to.have.property("statusCode", 200);
          gotUser = JSON.parse(body);
          done();
        })
      }
    })
    it('returned gotUser should have props from user[3]', function(){
      expect(gotUser).to.have.property('name', users[3].name);
      expect(gotUser).to.have.property('_id');
    });
  });
 
  //TODO: to edit/delete user, admin should have appropriate priviliges/features
  
  //edit user data by PUT /api/users/:id if you have premissions to edit user
  xdescribe("PUT /api/users/:id should edit user", function(){
    var gotUser;
    before(function(done){
      request.get(utils.url('/api/me'), {jar: u[1] }, gotU1);

      function gotU1(err, req, body){
        var user2 = JSON.parse(body);
        request.put(utils.url('/api/users/' + user2._id), {jar: u[3], form:{name:"newName"} },function(err, request, body){
          expect(request).to.have.property("statusCode", 200);
          gotUser = JSON.parse(body);
          done();
        })
      }
    })

    it('returned gotUser should have new name', function(){
      expect(gotUser).to.have.property('name', "newName");
    });
  });

  //delete user data by DELETE /api/users/:id if you have premissions to delete user
  xdescribe("DELETE /api/users/:id user should delete the user", function(){
    var statusCode;
    before(function(done){
      request.get(utils.url('/api/me'), {jar: u[2] }, gotU2);

      function gotU2(err, req, body){
        var user3 = JSON.parse(body);
        request.del(utils.url('/api/users/' + user3._id), {jar: u[3]},function(err, req, body){
          expect(req).to.have.property("statusCode", 200);
          request.get(utils.url('/api/users/' + user3._id), {jar: u[3]},function(err, req, body){
            statusCode = req.statusCode;
            done();
          })
        })
      }
    })
    it('the user should not exist anymore thus statusCode should be 404', function(){
      expect(statusCode).to.equal(404);
    });
  });
})

/**
 * A new suite for testing rooms handling logic, based on sockets
 */
describe("authenticate user with permissions", function(){

  var sockets = [];

  before(function(done){

    async.eachSeries(users, function(user, next){
      var jar = utils.authenticate(user, function(){
        var socket = eio('ws://' + nconf.get("server:hostname"));
        sockerClient(socket);
        sockets.push(socket);
        utils.authSock(socket, jar, next);
      });
    }, function(err) {
      expect(err).to.be.not.ok;
      done();
    });

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

    describe("READ /api/user/:id user should be able to get user info by Id", function(){

      var gotUser, socket;

      before(function(done){
        socket = sockets[0];
        socket.serve('READ /api/user/' + userProfiles[3]._id, function(err, data){
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

    describe("PUT /api/users/:id should edit user", function(){

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