module.exports = function(c){
  var message = {

    room: function(room){
      return {
        getById: function(id, cb){
          return c.hgetall('c:r:' + room.id + ':' + id, gotMessage);
          function gotRoom(err, result){
            if(err) return cb(err);
            if(!result) return cb();
            result.id = id;
            return cb(err, result);
          }
        },
        get: function(options, cb){
          // set of specific id's
          if(options && options.ids){
            var multi = c.multi();
            options.ids.forEach(function(id){
              multi.hgetall('c:r:' + room.id + ':' + id);
            })
            multi.exec(function(err, results){
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
            return c.get('c:r:'+ room.id +':ctr', gotStartIndex);
          }
          gotStartIndex(null, opts.from);
          // TODO: write unit tests
          function gotStartIndex(err, index){
            var count = opts.count;
            var multi = c.multi();
            if(count > 0){
              for(var i = 0; i < count - 1 || i < 0; i++){
                indexes.push(+ index + i);
                multi.hgetall('c:r:' + room.id + ':m:' + (+index + i));
              }
            } else {
              for(var i = 0; i <  (- count - 1) && (index - i) > 0; i++){
                indexes.push(+ index - i);
                multi.hgetall('c:r:' + room.id + ':m:' + (+index - i));
              }
            }
            multi.exec(function(err, results){
              if (err) return cb(err);
              results.forEach(function(val, i){
                results[i].id = indexes[i];
              });
              results.reverse();
              cb(null, results);
            })
          }
        },
        create: function(data, cb){
          c.incr('c:r:' + room.id + ':ctr', newMsgId);
          function newMsgId(err, id){
            data.tms = +new Date;
            c.hmset.apply(c, ['c:r:' + room.id + ':m:' + id].concat(r2o(data), [returnId(id)]));
          }
          function returnId(id){
            return function(err){
              cb(err, id);
            }
          }
        },
        update: function(id, data, cb){
          c.hmset.apply(c, ['c:r:' + room.id + ':m:' + id].concat(r2o(data), [returnId(id)]));
          function returnId(id){
            return function(err){
              cb(err, id);
            }
          }
        },
        //do we need it?
        del: function(id, cb){
          c.del('c:r:' + room.id + ':m:' + id, cb)
        }
      }
    }
  }
  return message;
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
      db.createCollection('message', function() {
        cb();
      });
    },
    room: function(rid){
      return {
        getMessages: function(cb){
          db.message.find({_rid: mongojs.ObjectId(rid)}).toArray(cb);
        },
        getMessage: function(mid, cb){
          db.message.findOne({_id: mongojs.ObjectId(mid)}, cb)
        },
        createMessage:function(message, cb){
          message._rid = mongojs.ObjectId(rid);
          db.message.save(message, cb);
        },
        deleteMessage: function(mid){
          db.message.remove({_id: mongojs.ObjectId(mid)}, cb);
        },
        updateMessage: function(mid, message){
          message._id = mongojs.ObjectId(mid);
          db.message.update({_id: message._id}, message, function(err) {
            cb(err, message);
          });
        }
      }
    }
  }
  }*/
