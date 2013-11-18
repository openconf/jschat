var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('engine.io-client');

before(function(done){
  utils.useCollections(['user','room'], done);
});

describe("github authenticattion", function(){
  before(function(done){
    utils.setUpAuthMock();
    request.get(utils.url('/auth/github/callback?code=450bab02b3f9bf0dfd44'), {jar: true},gotAuthResponse);
    function gotAuthResponse(err, response, body){
      expect(response).to.have.property('statusCode', 200);
      done();
    }
  })
  
  it("works!", function(done){
    done()
  });
  //todo write test for socket authentication
  xdescribe("GET /api/me endoint returns user profile", function(){
    var profile;
    before(function(done){
      request.get(utils.url('/api/me'), {jar: true},gotMe);
      function gotMe(err, response, body){
        expect(response).to.have.property('statusCode', 200);
        try{
          profile = JSON.parse(body);
        }catch(e){
          throw new Error("Response is not object");
        }
        done();
      }
    })
    it("returns user profile", function(){
      expect(profile).to.have.property('_id');
    })

    describe("ENGINE.IO authenticates the user", function(){
      before(function(done){
        var socket = eio('ws://' + nconf.get("server:hostname"));
        socket.on('open', function(){
          socket.send(JSON.stringify({
            t:'authorization', user: profile
          }));
          done();
        })
      });
      it('shouldn"t fail', function(done){
        process.nextTick(done);
      })
    })
  })
})
