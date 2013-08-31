var secure = require('secure.me')();
var passport = require('passport');
var USER = 'user';
var ADMIN = 'admin';
var _ = require('underscore');
var errors = require('../errors.js');

module.exports = function(app){
  function ensureUserBuilder(userType){
   return function (req, res, next){
      if(userType === USER && req.user){
        return next();
      }
      return next(errors.authRequiredError(': ' + req.session.user));
    }
  }

  function freeAccess(req, res, next){
    req.user = {
      admin: false,
      name: "Guest"
    }
    return next();
  }

  app.access = {
    free: freeAccess,
    ensureUser: ensureUserBuilder(USER)
  }
  secure.setMiddlewares([app.access.free]);
  secure.setDefault(app.access.ensureUser);

  secure.secureRoutes(app);
}

