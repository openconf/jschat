var _ = require('underscore');

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
      c.get('c:g2id:' + profile.id, userExists);
      function userExists(err, id){
        //user exists
        if(id) return user.getById(id, cb);
        //new user
        var data = transform(profile);
        user.create(data, createG2IDRef);
      }
      function createG2IDRef(err, id){
        c.set('c:g2id:' + profile.id, id, function(err){
          returnUser(err, id);
        });
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
        goOnline: function(cb){
          c.hset('c:u:' + usr.id, 'online', 1);
        },
        goOffline: function(cb){
          c.hset('c:u:' + usr.id, 'online', 0);
        },
        setStatus: function(status, cb){
          // 0 - online
          // 1 - dnd
          // 2 - away
          // 3 - hidden
          c.hset('c:u:' + usr.id, 'status', status, cb);
          return cb();
        },
        getRooms: function(cb){
          c.smembers('c:u:' + usr.id + ':rooms', cb);
        },
        joinRoom: function(rid, cb){
          //need to check if room exists
          c.sadd('c:u:' + usr.id + ':rooms', rid, joinUserObjectRoom(usr, rid, cb));
        },
        leaveRoom: function(rid, cb){
          c.srem('c:u:' + usr.id + ':rooms', rid, leaveUserObjectRoom(usr, rid, cb));
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

function r2o(data){
  var result = [];
  Object.keys(data).forEach(function(key){
    result = result.concat([key, data[key]]);
  })
  return result;
}
