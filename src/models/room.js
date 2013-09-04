var mongojs = require('mongojs');

// rooms:
//  _id:
//  description
//  public_id
//  [users]



module.exports = function(db){
  
  return {
    getById: function(id, cb){
      return db.user.findOne({_id: mongojs.ObjectId(id)}, cb);
    },
    create: function(room, cb){
      db.room.save(room ,cb);
    }
  }
}
