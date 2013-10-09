var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('engine.io-client');
var sockerClient = require('socker').client;
console.log(require('socker'));
var user1 = {
  name: "User1",
  id: 100
}
var user2 = {
  name: "User2",
  id: 101
}
before(function(done){
  utils.useCollections(['user','room'], function(){
    utils.clean("user", done);
  });
});

describe("authenticate users", function(){
  var sock1, sock2;
  before(function(done){
    var jar1 = utils.authenticate(user1, function(){
      sock1 = eio('ws://' + nconf.get("server:hostname"));
      sockerClient(sock1);
      utils.authSock(sock1, jar1, authUser2);
    });
    function authUser2(){
      var jar2 = utils.authenticate(user2, function(){
        sock2 = eio('ws://' + nconf.get("server:hostname"));
        sockerClient(sock2);
        utils.authSock(sock2, jar2, done);
      });
    }
  });

  describe("create room by last user", function(){
    var room;
    before(function(done){
      sock1.serve('CREATE /api/rooms', {name:"testName"}, function(err, data){
        expect(err).to.be.not.ok;
        room = data;
        done();
      });
    })
    it('should return _id defined', function(){
      expect(room).to.have.property('_id');
    });

    describe("join room by user1 and user2", function(){
      before(function(done){
        sock1.serve('JOIN /api/room/' + room._id, function(err){
          expect(err).to.be.not.ok;
          sock2.serve('JOIN /api/room/' + room._id, function(err){
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
          sock1.serve('CREATE /api/room/' + room._id + '/messages',{ message:"testMessage"}, done);
        })
        it('the message should be passed', function(done){
          expect(message).to.have.property("message", "testMessage");
          done();
        })
        //TODO:check the message was saved in DB
      });
    });
  })
})
