var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('engine.io-client');

var user1 = {
  name: "User1",
  id: 100
}
var user2 = {
  name: "User2",
  id: 101
}
describe("authenticate users", function(){
  var sock1, sock2;
  before(function(done){
    utils.authenticate(user1, function(){
      sock1 = eio('ws://localhost:8080');
      utils.authSock(sock1, authUser2);
    });
    function authUser2(){
      utils.authenticate(user2, function(){
        sock2 = eio('ws://localhost:8080');
        utils.authSock(sock2, done);
      });
    }
  })
  describe("create room by last user", function(){
    var roomId;
    before(function(done){
      request.post('http://localhost:8080/api/rooms',{form:{name:"testName"}, jar:true}, function(err, request, body){
        expect(request).to.have.property("statusCode", 200);
        roomId = JSON.parse(body)._id;
        done();
      })
    })

    describe("join room by user1 and user2", function(){
      before(function(done){
        sock1.send(JSON.stringify({t:"sys",r:roomId,m:"joinRoom"}));
        sock2.send(JSON.stringify({t:"sys",r:roomId,m:"joinRoom"}));
        setTimeout(done, 200);
      })

      describe("pass message from user1 into room", function(){
        var message="";
        before(function(done){
          sock2.on("message", function(data){
            message+=data;
          });
          sock1.send(JSON.stringify({t:'msg',r:roomId,m:"testMessage"}));
          setTimeout(done, 200);
        })

        it('will survive', function(done){
          expect(JSON.parse(message)).to.have.property("m", "testMessage");
          done();
        })
      })
      
    })
    
  })
  

})
