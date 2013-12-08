var request = require('request');
var utils = require('../utils.js')();
var expect = require('chai').expect;
var eio = require('../socketClientPatched');
var sockerClient = require('socker').client;

var user = {
  name: "User1",
  id: 100
}

before(function(done){
  utils.clean(done);
});

describe("github authenticattion", function(){
  before(function(done){
    utils.setUpAuthMock();
    request.get(utils.url('/auth/github/callback?code=450bab02b3f9bf0dfd44'), {jar: true}, gotAuthResponse);
    function gotAuthResponse(err, response, body){
      expect(response).to.have.property('statusCode', 200);
      done();
    }
  })

  it("works!", function(done){
    done()
  });

  //todo write test for socket authentication
  describe("GET /api/me endoint returns user profile", function(){
    var profile, socket;
    before(function(done){
      var jar = utils.authenticate(user, function(){
        socket = eio('ws://' + nconf.get("server:hostname"),{
            transports:['websocket'],
            header : {"Cookie": jar.cookies[0].str}
        });
        sockerClient(socket);
        socket.serve('READ /api/me', function(err, data) {
          profile = data;
          done();
        });
      });
    })
    it("returns user profile", function(){
      expect(profile).to.have.property('id');
      expect(profile).to.have.property('gh_id', '100');
    })
  })
})
