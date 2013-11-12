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
}
