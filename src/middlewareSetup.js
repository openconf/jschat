var passport = require('passport');
var _ = require('underscore');
var express = require('express');

var errors = require('./errors.js');


var GitHubStrategy = require('passport-github').Strategy;
var util = require('util');
var fs = require('fs');

var User = require('./models').user;
var nock = require('nock');

module.exports = function(app){
  passport.use(new GitHubStrategy({
    clientID: nconf.get('github:GITHUB_CLIENT_ID'),
    clientSecret: nconf.get('github:GITHUB_CLIENT_SECRET'),
    callbackURL: nconf.get('server:callbackurl')
    },
    function(token, tokenSecret, profile, done) {
      User.signupGithubUser(profile, gotUser);
      function gotUser(err, user){
        if(err){
          //WE can handle login errors here
          return done(err);
        }
        User.of(user).getRooms(function(err, rooms){
          user.rooms = rooms;
          return done(null, user)
        });
      }
    }
  ))
   
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    //TODO: it might need refactoring to lower redis calls
    User.getById(id, function(err, user){
      User.of(user).getRooms(function(err, rooms){
        user.rooms = rooms;
        return done(null, user)
      });
    });
  });

  //compress all output
//  app.use(express.compress());
  // Serve up the favicon
//  app.use(express.favicon(nconf.get('server:clientDistFolder') + '/favicon.ico'));
  nconf.set('sessions',{
    parser: express.cookieParser(),
    key: 'sid',
    secret: nconf.get('security:salt')
  })

  app.use(express.logger());                                  // Log requests to the console
  app.use(express.bodyParser());                              // Extract the data from the body of the request - this is needed by the LocalStrategy authenticate method
  app.use(nconf.get('sessions:parser'));  // Hash cookies with this secret
  
  app.use(express.session({
    secret: 'secret',
    store: app.ms,
    key: 'sid'
  }));                           // Store the session in the (secret) cookie
  app.use(passport.initialize());
  app.use(passport.session());

  //put the user inside request
  app.use(function(req,res,next){
    if(req.user) {
      console.log("UserID: " + req.user._id)
      req.session.user = req.user;
    }
    next();
  });
  
  app.use(express.static(__dirname + "/../webapp/"));
  
  
  app.get('/auth/github', app.access.free, rememberBackUrl,
    passport.authenticate('github'),
    function(req,res){});
  app.get('/auth/github/callback', app.access.free,
    passport.authenticate('github', {failureRedirect:"/auth/github/failure"}),
    function(req, res, next){
      if(req.session.backUrl && !!~req.session.backUrl.indexOf('app://')) { //app:/
        res.end('<script>window.history.back()</script>');
        delete req.session.backUrl;
        return;
      }
      if(req.session.backUrl) {
        res.redirect(decodeURIComponent(req.session.backUrl));
        delete req.session.backUrl;
        return;
      }
      res.redirect('/');
    }
  );

  function rememberBackUrl(req, res, next){
    req.session.backUrl = req.query.backUrl;
    next();
  }
  app.get('/', function(req, res) {
    res.send(200);
  })


};
