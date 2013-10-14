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
        cb();
      });
    },
    getById: function(id, cb){
      db.room.findOne({_id: mongojs.ObjectId(id)}, cb);
    },
    getAll: function(ownerId, cb){
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
    }
  }
}
