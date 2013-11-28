module.exports = function(c){
  var room = {
    getById: function(id, cb){
      return c.hgetall('c:r:' + id, gotRoom);
      function gotRoom(err, result){
        if(err) return cb(err);
        if(!result) return cb();
        result.id = id;
        return cb(err, result);
      }
    },
    get: function(options, cb){
      // set of specific id's
      console.log(options);
      if(options.ids){
        var multi = c.multi();
        options.ids.forEach(function(id){
          multi.hgetall('c:r:' + id);
        })
        multi.exec(function(err, results){
          console.log(results)
          if (err) return cb(err);
          results.forEach(function(val, i){
            results[i].id = options.ids[i];
          });
          cb(null, results);
        })
        return;
      }
      // oherwise a range
      var opts = options || {count: -100}
      var indexes = [];
      //options
      //- from
      //- count
      if (!opts.from){
        return c.get('c:r:ctr', gotStartIndex);
      }
      gotStartIndex(null, opts.from);
      // TODO: write unit tests
      function gotStartIndex(err, index){
        var count = opts.count;
        var multi = c.multi();
        if(count > 0){
          for(var i = 0; i < count - 1 || i < 0; i++){
            indexes.push(+ index + i);
            multi.hgetall('c:r:' + (+index + i));
          }
        } else {
          for(var i = 0; i <  (- count - 1) && (index - i) > 0; i++){
            indexes.push(+ index - i);
            multi.hgetall('c:r:' + (+index - i));
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
      c.incr('c:r:ctr', newRoomId);
      function newRoomId(err, id){
        c.hmset.apply(c, ['c:r:' + id].concat(r2o(data), [returnId(id)]));
      }
      function returnId(id){
        return function(err){
          cb(err, id);
        }
      }
    },
    update: function(id, data, cb){
      c.hmset.apply(c, ['c:r:' + id].concat(r2o(data), [returnId(id)]));
      function returnId(id){
        return function(err){
          cb(err, id);
        }
      }
    },
    //do we need it?
    del: function(id, cb){
      c.del('c:r:' + id, cb)
    },
    users: function(usr){
      return {
        join: function(rid, cb){
          c.sadd('c:r:' + rid + ':p', usr.id, cb);
        },
        leave: function(rid, cb){
          c.srem('c:r:' + rid + ':p', usr.id, cb)
        }
      }
    }
  }
  return room;
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

// rooms:
//  _id:
//  description
//  public_id
//  [users]



module.exports = function(db){
  
  return {
    init: function(cb){
      db.createCollection('room', function() {
        db.createCollection('messages', function() {
          cb();
        });
      });
    },
    getById: function(id, cb){
      db.room.findOne({_id: mongojs.ObjectId(id)}, cb);
    },
    getAll: function(options, cb){
      if(!cb) {
        cb = options;
        options = {};
      }
      db.room.find(options).toArray(cb);
    },
    getByOwnerId: function(ownerId, cb){
      db.room.find({owner: ownerId}).toArray(cb);
    },
    updateById: function(id, room, cb){
      room._id = mongojs.ObjectId(id);
      db.room.update({_id: room._id}, room, function(err) {
        cb(err, room);
      });
    },
    join: function(rid, uid, cb){
      db.room.update({_id: mongojs.ObjectId(rid),
                          'users':{ $nin : [ uid ] }},
                            { $push: {'users' : uid}}, cb);
    },
    leave: function(rid, uid, cb){
      db.room.update({_id: mongojs.ObjectId(rid),
                          'users':{ $nin : [ uid ] }},
                            { $push: {'users' : uid}}, cb);
      db.room.findOne({_id: mongojs.ObjectId(rid)}, gotRoom);
      function gotRoom(err, resRoom){
        var index = resRoom.users.indexOf(uid);
        if(!!~index){
          resRoom.users.splice(index, 1);
        }
        db.room.update({_id: mongojs.ObjectId(rid)},
                      { $set: {users: resRoom.users}},cb);
      }
    },
    create: function(room, cb){
      db.room.save(room ,cb);
    },
    deleteById: function(id, cb){
      db.room.remove({_id: mongojs.ObjectId(id)}, cb);
    },
    room: function(rid){
      return {
        getMessages: function(cb){
          db.messages.find({_rid: mongojs.ObjectId(rid)}).toArray(cb);
        },
        getMessage: function(mid, cb){
          db.messages.findOne({_id: mongojs.ObjectId(mid)}, cb)
        },
        createMessage:function(message, cb){
          message._rid = mongojs.ObjectId(rid);
          db.messages.save(message, cb);
        },
        deleteMessage: function(mid){
          db.messages.remove({_id: mongojs.ObjectId(mid)}, cb);
        },
        updateMessage: function(mid, message){
          message._id = mongojs.ObjectId(mid);
          db.messages.update({_id: message._id}, message, function(err) {
            cb(err, message);
          });
        }
      }
    }
  }
}*/
