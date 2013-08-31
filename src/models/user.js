var mongojs = require('mongojs');

module.exports = function(db){
  
  return {
    getById: function(id, cb){
      return db.user.findOne({_id: mongojs.ObjectId(id)}, cb);
    },
    getGithubUser: function(profile, cb){
      db.user.find({'github.id': profile.id}, gotUser);
      var that = this;
      function gotUser (err, users){
        if(err){
          return cb(err);
        }
        if(users.length === 0){
          return db.user.save({
            github: profile
          },cb);
        }
        if(users.length > 1){
          return cb(errors.authError('we got multiple users with same mail in DB'));
        }

        cb(null, users[0]);
      }
    }
  }
}
