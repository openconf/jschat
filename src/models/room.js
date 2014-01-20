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
      if(options && options.ids){
        var multi = c.multi();
        options.ids.forEach(function(id){
          multi.hgetall('c:r:' + id);
          multi.smembers('c:r:' + id + ':p');
        })
        multi.exec(function(err, results){
          var resultArray = [];
          if (err) return cb(err);
          options.ids.forEach(function(val, i){
            resultArray[i] = results[i*2];
            resultArray[i].id = options.ids[i];
            resultArray[i].participants = results[i*2 + 1];
          });
          cb(null, resultArray);
        })
        return;
      }
      // oherwise a range
      var opts = options || {};
      opts.count = opts.count || -100;
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
    setLastActive: function(id, tms, cb){
      //get c:r:last <sorted set>
      // score - timestamp
      // ZADD c:r:last <timestamp> <id>
      // ZREMRANGEBYRANK c:r:last 0 -6
      // ZRANGE myzset 0 -1
      var multi = c.multi();
      multi.zadd('c:r:last', tms, id);
      multi.zremrangebyrank('c:r:last', 0, -6);
      multi.exec(function(err, results){
        if (err) return cb(err);
        cb(null, results);
      });
    },
    getLastActive: function(cb){
      c.zrange('c:r:last', 0, -1, gotLastActive);
      function gotLastActive(err, results){
        cb(err,results.reverse());
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
        get: function(rid, cb){
          c.smembers('c:r:' + rid + ':p', cb)
        },
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
