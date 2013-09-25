var mongojs = require('mongojs');

// rooms:
//  _id:
//  description
//  public_id
//  [users]



module.exports = function(db){
  
  return {
    init: function(cb){
      return db.createCollection('room', function(err, collection) {
          cb();
      });
    },
    getById: function(id, cb){
      return db.room.findOne({_id: mongojs.ObjectId(id)}, cb);
    },
    create: function(room, cb){
      // check if room withhhs name exists - error if exists
      db.room.save(room ,cb);
    }
  }
}
