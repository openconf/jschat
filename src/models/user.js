function transform(profile){
  var transformer = {
    'displayName':'displayName',
    'gh_username':'username',
    'gh_id':'id',
    'email': function(config){
      return config.emails && config.emails[0] && config.emails[0].value;
    },
    'gh_avatar': function(config){
      return config._json && config._json.avatar_url;
    },
    'gh_bio': function(config){
      return config._json && config._json.bio;
    },
    'gh_profileUrl': 'profileUrl'
  };
  var result = {};
  Object.keys(transformer).forEach(function(key){
    var val;
    if(typeof(transformer[key]) == 'function'){
      val = transformer[key].call(this, profile);
    }
    val = val || profile[transformer[key]];
    if(val) result[key] = val;
  });
  return result;
}

module.exports = function(c){
  var user = {
    signupGithubUser: function(profile, cb){
      c.get('c:g2id', userExists);
      function userExists(err, id){
        //user exists
        if(id) return user.getById(id, cb);
        //new user
        var data = transform(profile);
        user.create(data, returnUser);
      }
      function createG2IDRef(err, id){
      
      }
      function returnUser(err, id){
        if(err) return cb(err);
        user.getById(id, cb);
      }
    },
    getById: function(id, cb){
      return c.hgetall('c:u:' + id, transformToObject);
      function transformToObject(err, result){
        if(err) return cb(err);
        result.id = id;
        return cb(err, result);
      }
    },
    get: function(options, cb){
      var opts = options || {count: -100}
      var indexes = [];
      //options
      //- from
      //- count
      if (!opts.from){
        return c.get('c:u:ctr', gotStartIndex);
      }
      gotStartIndex(null, opts.from);
      // TODO: write unit tests
      function gotStartIndex(err, index){
        var count = opts.count;
        var multi = c.multi();
        if(count > 0){
          for(var i = 0; i < count - 1 || i < 0; i++){
            indexes.push(+ index + i);
            multi.hgetall('c:u:' + (+index + i));
          }
        } else {
          for(var i = 0; i <  (- count - 1) && (index - i) > 0; i++){
            indexes.push(+ index - i);
            multi.hgetall('c:u:' + (+index - i));
          }
        }
        multi.exec(function(err, results){
          if (err) return cb(err);
          results.forEach(function(val, i){
            results[i].id = indexes[i];
          });
          cb(null, results);
        })
      }
    },
    create: function(data, cb){
      c.incr('c:u:ctr', newUserId);
      function newUserId(err, id){
        c.hmset.apply(c, ['c:u:' + id].concat(r2o(data), [returnId(id)]));
      }
      function returnId(id){
        return function(err){
          cb(err, id);
        }
      }
    },
    update: function(id, data, cb){
      c.hmset.apply(c, ['c:u:' + id].concat(r2o(data), [returnId(id)]));
      function returnId(id){
        return function(err){
          cb(err, id);
        }
      }
    },
    //do we need it?
    del: function(id, cb){
      c.del(id, cb)
    },
    of: function(usr){
      return {
        joinRoom: function(rid, cb){
          //need to check if room exists
          c.sadd('c:u:' + usr.id + ':rooms', rid, joinUserObjectRoom(user, rid, cb));
        },
        leaveRoom: function(rid, cb){
          c.srem('c:u:' + usr.id + ':rooms', rid, leaveUserObjectRoom(user, rid, cb));
        }
      }
    }
  }
  return user;
}

function joinUserObjectRoom(user, roomId, cb){
  return function(err, dbuser){
    if(!user.rooms) user.rooms = [];
    user.rooms.push(roomId);
    user.rooms = _(user.rooms).uniq();
    cb(err, dbuser);
  }
}

function r2o(data){
  var result = [];
  Object.keys(data).forEach(function(key){
    result = result.concat([key, data[key]]);
  })
  return result;
}

/*
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
*/
