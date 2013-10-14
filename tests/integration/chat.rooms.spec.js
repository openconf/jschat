var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('engine.io-client');
var async = require('async');
var _ = require('underscore');
var sockerClient = require('socker').client;

var user1 = {
  name: "User1",
  id: 100
};

var roomMock = {
  name: "roomName",
  description: "roomDescription"
};

before(function(done){
  utils.useCollections(['user', 'room'], function(){
    utils.clean("room", done);
  });
});

/*
 * A deprecated suite for legacy REST-based API
 * An identic socket-based suite is below...
*/

describe("authenticate user", function(){
  var u;
  before(function(done){
    u = utils.authenticate(user1, done);
  });
  describe("POST /api/rooms user should be able to create room", function(){
    var room;
    before(function(done){
      request.post(utils.url('/api/rooms'),{form: roomMock, jar: u}, function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        room = JSON.parse(body);
        done();
      });
    });
    it('returned room should have props from roomMock', function(){
      expect(room).to.have.property('name', roomMock.name);
      expect(room).to.have.property('description', roomMock.description);
      expect(room).to.have.property('_id');
    });
    it('room should have owner - reference to the user that created the room', function(){
      expect(room).to.have.property('owner');
    });

    describe("GET /api/rooms/:id user should be able to get room info by Id", function(){
      var getRoom;
      before(function(done){
        request.get(utils.url('/api/rooms/' + room._id), {jar: u },function(err, requestObject, body){
          expect(requestObject).to.have.property("statusCode", 200);
          getRoom = JSON.parse(body);
          done();
        });
      });
      it('returned getRoom should have props from roomMock', function(){
        expect(getRoom).to.have.property('name', roomMock.name);
        expect(getRoom).to.have.property('description', roomMock.description);
        expect(getRoom).to.have.property('_id');
      });
      it('getRoom should have owner - reference to the user that created the room', function(){
        expect(getRoom).to.have.property('owner');
      });
    });

    describe("PUT /api/rooms/:id user should edit room", function(){
      var getRoom;
      before(function(done){
        request.put(utils.url('/api/rooms/' + room._id), {jar:u, form: _.extend(roomMock, {name: 'newName'})}, function(err, requestObject, body){
          expect(requestObject).to.have.property("statusCode", 200);
          request.get(utils.url('/api/rooms/' + room._id), {jar: u},function(err, requestObject, body){
            expect(requestObject).to.have.property("statusCode", 200);
            getRoom = JSON.parse(body);
            done();
          });
        });
      });
      it('returned getRoom should have new name', function(){
        expect(getRoom).to.have.property('name', "newName");
      });
    });

    describe("DELETE /api/rooms/:id user should delete the room", function(){
      var statusCode;
      before(function(done){
        request.del(utils.url('/api/rooms/' + room._id), {jar: u},function(err, requestObject, body){
          expect(requestObject).to.have.property("statusCode", 200);
          request.get(utils.url('/api/rooms/' + room._id), {jar: u},function(err, requestObject, body){
            statusCode = requestObject.statusCode;
            done();
          });
        });
      });
      it('the room should not exist anymore thus statusCode should be 404', function(){
        expect(statusCode).to.equal(404);
      });
    });
  })


  describe("create several rooms", function(){
    var rooms = ['1','2','3','4'];
    before(function(done){
      async.each(rooms, function(item, cb){
        var mock = _(roomMock).extend({name : item});
        request.post(utils.url('/api/rooms'),{form: mock, jar: u}, cb);
      }, done);
    });

    describe("GET /api/rooms get all rooms", function(){
      var gotRooms;
      before(function(done){
        request.get(utils.url('/api/rooms/'), {jar: u},function(err, requestObject, body){
          expect(requestObject).to.have.property("statusCode", 200);
          gotRooms = JSON.parse(body);
          done();
        });
      });
      it('It should return right number of results', function(){
        expect(gotRooms).to.have.length(rooms.length);
      });
      it('names should be the same', function(){
        var names = _(gotRooms).pluck('name');
        expect(_.difference(names, rooms)).to.be.empty;
      });
    });
  });
});


/*
 *
 * A new suite for testing rooms handling logic, based on sockets
 *
 */

describe("Socket based authenticate users", function(){
  var sock1;
  before(function(done){
    var jar1 = utils.authenticate(user1, function(){
      sock1 = eio('ws://' + nconf.get("server:hostname"));
      sockerClient(sock1);
      utils.authSock(sock1, jar1, done);
    });
  });

  describe("User should be able to create room", function(){

    var room;

    before(function(done){
      sock1.serve('CREATE /api/rooms', roomMock, function(err, data){
        expect(err).to.be.not.ok;
        room = data;
        done();
      });
    });

    it('returned room should have props from roomMock', function() {
      expect(room).to.have.property('name', roomMock.name);
      expect(room).to.have.property('description', roomMock.description);
      expect(room).to.have.property('_id');
    });

    it('room should have owner - reference to the user that created the room', function(){
      expect(room).to.have.property('owner');
    });

    describe("User should be able to get room info by Id", function(){

      var getRoom;

      before(function(done){
        sock1.serve('READ /api/room/' + room._id, function(err, data){
          expect(err).to.be.not.ok;
          getRoom = data;
          done();
        });
      });

      it('returned getRoom should have props from roomMock', function(){
        expect(getRoom).to.have.property('name', roomMock.name);
        expect(getRoom).to.have.property('description', roomMock.description);
        expect(getRoom).to.have.property('_id');
      });

      it('getRoom should have owner - reference to the user that created the room', function(){
        expect(getRoom).to.have.property('owner');
      });

    });

    describe("User should be able to edit the room", function(){

      var getRoom;

      before(function(done){
        sock1.serve('UPDATE /api/room/' + room._id, _.extend(roomMock, {name: 'newName'}), function(err, data){
          expect(err).to.be.not.ok;
          sock1.serve('READ /api/room/' + room._id, function(err, data){
            expect(err).to.be.not.ok;
            getRoom = data;
            done();
          });
        });
      });

      it('returned getRoom should have new name', function(){
        expect(getRoom).to.have.property('name', "newName");
      });

    });

    describe("User should be able to delete the owned room", function(){

      var statusCode;

      before(function(done){
        sock1.serve('DELETE /api/room/' + room._id, function(err, data){
          expect(err).to.be.not.ok;
          expect(data).to.have.property("statusCode", 200);
          sock1.serve('READ /api/room/' + room._id, function(err, data){
            expect(err).to.be.not.ok;
            expect(data).to.have.property("statusCode");
            statusCode = data.statusCode;
            done();
          });
        });
      });

      it('the room should not exist anymore thus statusCode should be 404', function(){
        expect(statusCode).to.equal(404);
      });

    });

    describe("create several rooms", function(){

      var rooms = ['1','2','3','4'];

      before(function(done){
        async.each(rooms, function(item, cb){
          var mock = _(roomMock).extend({name : item});
          sock1.serve('CREATE /api/rooms', mock, cb);
        }, done);
      });

      describe("Should be able to get all the rooms of mine", function(){

        var gotRooms;

        before(function(done){
          sock1.serve('READ /api/rooms', function(err, data){
            expect(data).to.have.property("statusCode", 200);
            gotRooms = data.rooms;
            done();
          });
        });

        it('It should return right number of results', function(){
          expect(gotRooms).to.have.length(rooms.length);
        });

        it('names should be the same', function(){
          var names = _(gotRooms).pluck('name');
          expect(_.difference(names, rooms)).to.be.empty;
        });

      });

    });

  });

});
