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
}
