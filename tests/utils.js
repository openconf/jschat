var nock = require('nock');
var _ = require("underscore");
var request = require('request');
var models = require('../src/models');
var async = require('async');

module.exports = function(){
  return {
    setUpAuthMock: setUpAuthMock,
    authenticate: authenticate,
    authSock:authSock,
    getSignedUser: getSignedUser,
    clean: clean,
    url:url,
    useCollections:useCollections 
  }


  function useCollections(collections, cb){
    async.each(collections, function(item, done){
      models[item].init(done);
    }, cb);
  };

  function url(u){
    return "http://" + nconf.get("server:hostname") + u;
  }

  function clean(collection, cb){
    models[collection].drop(cb);
  }

  function getSignedUser(cb, u){
    var profile;
    request.get('http://127.0.0.1:8080/api/me', {jar: u || true}, gotMe);
    function gotMe(err, response, body){
      try{
        profile = JSON.parse(body);
      }catch(e){
        throw new Error("Response is not object");
      }
      cb(null, profile);
    }
  }

  function authSock(socket, cb){
    var profile;
    request.get('http://127.0.0.1:8080/api/me', {jar: true}, gotMe);
    function gotMe(err, response, body){
      
      try{
        profile = JSON.parse(body);
      }catch(e){
        throw new Error("Response is not object");
      }
      if (socket.readyState == 'open') return sendAuthorization();
      socket.on('open', sendAuthorization);
      function sendAuthorization(){
        socket.send(JSON.stringify({
          t:'authorization', user: profile
        }));
        process.nextTick(cb);
      }
    }
  }

  function userCan(features, user, cb){
    ///TODO: add features for user//models.user.update
  }

  function authenticate(user ,cb){
    if(_(user).isFunction()) cb = user;
    setUpAuthMock(user);
    var u = request.jar();
    request.get('http://127.0.0.1:8080/auth/github/callback?code=450bab02b3f9bf0dfd44', {jar: u}, cb);
    return u;
  }
  
  
  function setUpAuthMock(user){
    nock('https://github.com:443')
      .post('/login/oauth/access_token', "grant_type=authorization_code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8080%2Fauth%2Fgithub%2Fcallback&client_id=0bb5305f1db7d2816fa3&client_secret=32d469aa1334e0a29caac7a20054fa57c0c26088&type=web_server&code=450bab02b3f9bf0dfd44")
      .reply(200, "access_token=3af579594fcf37b9d9d646e6f0798e1674f7cfe9&token_type=bearer", { server: 'GitHub.com',
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        status: '200 OK',
        'cache-control': 'private, max-age=0, must-revalidate',
        'strict-transport-security': 'max-age=2592000',
        'x-frame-options': 'deny',
        'set-cookie': 
        [ 'logged_in=no; domain=.github.com; path=/; expires=Tue, 06-Sep-2033 19:03:42 GMT; secure; HttpOnly',
          'dotcom_user=; path=/; expires=Thu, 01-Jan-1970 00:00:00 GMT',
          '_gh_sess=BAh7BjoPc2Vzc2lvbl9pZCIlOTdhYjgyNDU4ZDVkOWM4NzM5NGMxYWMwOTlmMTE2NzM%3D--8fe8511ecbfa197eacb96940fb9a66261d10c57a; path=/; expires=Sun, 01-Jan-2023 00:00:00 GMT; secure; HttpOnly' ],
        'x-runtime': '26',
        'content-length': '71',
        'x-github-request-id': '9cade243-6d5c-48ec-a5fd-e83001120c98',
        vary: 'Accept-Encoding' });

    var defaultUser = {
      login: 'testuser',
      id: "666",
      type: "User",
      name: "Test User",
      company: "Test Company",
      email: "test@test.com"
    }
    _(defaultUser).extend(user);

    nock('https://api.github.com:443')
      .get('/user?access_token=3af579594fcf37b9d9d646e6f0798e1674f7cfe9')
      .reply(200, JSON.stringify(defaultUser), { server: 'GitHub.com',
          date: 'Fri, 06 Sep 2013 19:03:42 GMT',
          'content-type': 'application/json; charset=utf-8',
          status: '200 OK',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': '1378497822',
          'cache-control': 'private, max-age=60, s-maxage=60',
          'last-modified': 'Thu, 05 Sep 2013 18:57:09 GMT',
          etag: '"cd8d7fb6065dc97afd45baaa163fa1c7"',
          'x-oauth-scopes': '',
          'x-accepted-oauth-scopes': 'user, user:email, user:follow, site_admin',
          vary: 'Accept, Authorization, Cookie',
          'x-github-media-type': 'github.beta; format=json',
          'x-content-type-options': 'nosniff',
          'content-length': '1698',
          'access-control-allow-credentials': 'true',
          'access-control-expose-headers': 'ETag, Link, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes',
          'access-control-allow-origin': '*',
          'x-github-request-id': 'c72a86c8-ed9f-460b-a26f-b96a75729fd6' });
  }
}
