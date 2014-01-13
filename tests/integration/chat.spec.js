var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('../socketClientPatched');
var sockerClient = require('socker').client;
var roomModel = require('../../src/models').room;

var user1 = {
  name: "User1",
  id: 100
}
var user2 = {
  name: "User2",
  id: 101
}
before(function(done){
  utils.clean(done);
});

describe("authenticate users", function(){
  var sock1, sock2;
  before(function(done){
    var jar1 = utils.authenticate(user1, function(){
      sock1 = eio('ws://' + nconf.get("server:hostname"),{
          transports:['websocket'],
          header:{"Cookie":jar1.cookies[0].str}
        });
      sockerClient(sock1);
      authUser2()
    });
    function authUser2(){
      var jar2 = utils.authenticate(user2, function(){
        sock2 = eio('ws://' + nconf.get("server:hostname"),{
          transports:['websocket'],
          header:{"Cookie":jar2.cookies[0].str}
        });
        sockerClient(sock2);
        done()
      });
    }
  });

  describe("create room by last user", function(){
    var room;
    before(function(done){
      sock1.serve('CREATE /api/rooms', {name:"testName"}, function(err, data){
        expect(err).to.be.not.ok;
        roomModel.getById(data, function(err, roomData){
          room = roomData;
          done();
        });
      });
    })
    it('should return _id defined', function(){
      expect(room).to.have.property('id');
    });

    describe("join room by user1 and user2", function(){
      before(function(done){
        sock1.serve('JOIN /api/rooms/' + room.id, function(err){
          expect(err).to.be.not.ok;
          sock2.serve('JOIN /api/rooms/' + room.id, function(err){
            expect(err).to.be.not.ok;
            done();
          });
        });
      })

      describe("pass message from user1 into room", function(){
        var message;
        before(function(done){
          sock2.on("message", function(data){
            message = JSON.parse(data);
          });
          sock1.serve('CREATE /api/rooms/' + room.id + '/messages',{ message:"testMessage"}, function(){
            done();
          });
        })
        it('the message should be passed', function(done){
          expect(message).to.have.property("message", "testMessage");
          done();
        })
        it('the message should be saved in DB', function(done){
          sock2.serve('READ /api/rooms/' + room.id + '/messages/' + message.id, function (err, msg) {
            expect(msg).to.have.property("message",  message.message)
            expect(msg).to.have.property("uid", String(message.uid))
            expect(msg).to.have.property("id",  String(message.id))
            expect(msg).to.have.property("tms", String(message.tms))
            done()
          })
        })
      });
    });
  })
})
