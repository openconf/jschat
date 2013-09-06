var mongojs = require('mongojs');
var _ = require('underscore');

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
    },
    user: function(user){
      var u = {
        joinRoom: function(roomId, cb){
          // check if user already have the roomId in rooms
          db.user.update({_id: mongojs.ObjectId(user._id), 
                          'rooms':{ $nin : [ roomId ] }}, 
                            { $push: {'rooms' : roomId}}, joinUserObjectRoom(user, roomId, cb));
        }
      }
      
      return u;
    }
  }
}

function joinUserObjectRoom(user, roomId, cb){
  return function(err, dbuser){
    if(!user.rooms) user.rooms = [];
    user.rooms.push(roomId);
    user.rooms = _(user.rooms).uniq();
    cb(err, dbuser);
  }
}
