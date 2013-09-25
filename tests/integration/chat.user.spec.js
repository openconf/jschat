var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('engine.io-client');
var async = require('async');
var _ = require('underscore');

var user1 = {
  name: "User1",
  id: 100
}
var user2 = {
  name: "User2",
  id: 101
}
var user3 = {
  name: "User3",
  id: 102
}


before(function(done){
  utils.useCollections(['user', 'room'], function(){
    utils.clean("user", done);
  })
});

xdescribe("authenticate user with premissions", function(){
  var u;
  before(function(done){
    u = utils.authenticate(user1, done);
  })
  //put 4 users
  //get all of them by GET /api/users
  //get specific user info by id GET /api/users/:id
  //edit user data by PUT /api/users/:id if you have premissions to edit user
  //delete user data by DELETE /api/users/:id if you have premissions to delete user
  //edit self profile by PUT /api/me if user is /me
  //delete profile by DELETE /api/me if user is /me
  //get profile by /api/me
  //
  /*
  describe("GET /api/users get all users", function(){
    var gotRooms;
    before(function(){
      request.get(utils.url('/api/rooms/'), {jar: u},function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        gotRooms = JSON.parse(body);
        done();
      })
    });
    it('It should return right number of results', function(){
      expect(gotRooms).to.have.length(rooms.length);
    })
    it('names should be the same', function(){
      var names = _(gotRooms).pluck('name');
      expect(_.difference(names, rooms)).to.be.empty;
    })
  })


  xdescribe("GET /api/users/:id user should be able to get user info by Id", function(){
    var gotUser;
    before(function(done){
      request.get(utils.url('/api/users/' + room._id), {jar: u },function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        getRoom = JSON.parse(body);
        done();
      })
    })
    it('returned gotUser should have props from roomMock', function(){
      expect(getRoom).to.have.property('name', roomMock.name);
      expect(getRoom).to.have.property('description', roomMock.description);
      expect(getRoom).to.have.property('_id');
    });
    it('getRoom should have owner - reference to the user that created the room', function(){
      expect(getRoom).to.have.property('owner');
    });
  });

  xdescribe("PUT /api/rooms/:id user should edit room", function(){
    var getRoom;
    before(function(done){
      request.put(utils.url('/api/rooms/' + room._id), {jar:u, form:{name:"newName"}}, function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        request.get(utils.url('/api/rooms/' + room._id), {jar: u},function(err, request, body){
          expect(request).to.have.property("statusCode", 200);
          getRoom = JSON.parse(body);
          done();
        })
      })
    })
    it('returned getRoom should have new name', function(){
      expect(getRoom).to.have.property('name', "newName");
    });
  });

  xdescribe("DELETE /api/rooms/:id user should delete the room", function(){
    var statusCode;
    before(function(done){
      request.del(utils.url('/api/rooms/' + room._id), {jar: u},function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        request.get(utils.url('/api/rooms/' + room._id), {jar: u},function(err, request, body){
          statusCode = request.statusCode;
          done();
        })
      })
    })
    it('the room should not exist anymore thus statusCode should be 404', function(){
      expect(statusCode).to.equal(404);
    });
  });
})


xdescribe("create several rooms", function(){
  var rooms = [1,2,3,4];
  before(function(done){
    async.each(rooms, function(item, cb){
      var mock = _(roomMock).extend({name : item});
      request.post(utils.url('/api/rooms'),{form: mock, jar: u}, cb);
    }, done);
  })
  describe("GET /api/rooms get all rooms", function(){
    var gotRooms;
    before(function(){
      request.get(utils.url('/api/rooms/'), {jar: u},function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        gotRooms = JSON.parse(body);
        done();
      })
    });
    it('It should return right number of results', function(){
      expect(gotRooms).to.have.length(rooms.length);
    })
    it('names should be the same', function(){
      var names = _(gotRooms).pluck('name');
      expect(_.difference(names, rooms)).to.be.empty;
    })
  })
  */
})
