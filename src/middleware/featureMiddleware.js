var errors = require('../errors.js');
// feature access middleware
// so, endpoint access could be controlled by this feature access middleware
// if user have this feature in FA middleware than it will work
// otherwise - no
module.exports = function(featureName){
  return function(req, res, next){
    if(req.session.user && req.session.user.features && req.session.user.features[featureName]){
      return next();
    }
    return next(errors.featureAccessError("The user  doesn't have priviliges to access this endpoint"));
  }
}
