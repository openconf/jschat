var mongojs = require('mongojs');
var _ = require('underscore');

module.exports = function(db){
  
  return {
    init: function(cb){
      return db.createCollection('user', function(err, collection) {
          cb();
      });
    },
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
    getAllUsers: function(cb) {
      db.user.find().toArray(cb);
    },
    updateById: function(id, updates, cb) {
      delete updates._id;
      db.user.update({_id: mongojs.ObjectId(id)}, updates, function(err) {
        cb(err, updates);
      });
    },
    user: function(user){
      var u = {
        joinRoom: function(roomId, cb){
          // check if user already have the roomId in rooms
          db.user.update({_id: mongojs.ObjectId(user._id), 
                          'rooms':{ $nin : [ roomId ] }}, 
                            { $push: {'rooms' : roomId}}, joinUserObjectRoom(user, roomId, cb));
        },
        leaveRoom: function(roomId, cb){
          // check if user already have the roomId in rooms
          db.user.findOne({_id: mongojs.ObjectId(user._id)}, gotUser);
          function gotUser(err, resUser){
            var index = resUser.rooms.indexOf(roomId);
            if(!!~index){
              resUser.rooms.splice(index, 1);
            }
            db.user.update({_id: mongojs.ObjectId(user._id)},
                          { $set: {rooms: resUser.rooms}}, 
                             leaveUserObjectRoom(user, roomId, cb));
          }
        },
        edit: function(updates, cb){
          delete updates._id;
          db.user.update({_id: mongojs.ObjectId(user._id)}, updates, function(err) {
            cb(err, updates);
          });

        },
        delete: function(cb) {
          db.user.remove({_id: mongojs.ObjectId(user._id)}, cb);
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
function leaveUserObjectRoom(user, roomId, cb){
  return function(err, dbuser){
    if(!user.rooms) user.rooms = [];
    var index = user.rooms.indexOf(roomId);
    if(!!~index){
      user.rooms.splice(index, 1);
    }
    cb(err, dbuser);
  }
}
