var roomModelsCache = {};
var RoomModel = require('./Room');
var RoomsCollection = require('./Rooms');
var _ = require('underscore');
var currentRoomId;

var getRoomModel = function(id){
    if(id && roomModelsCache[id]){
      return roomModelsCache[id];
    }
    var room = new RoomModel({id: id});
    if(room.get('id')){
      room.fetch();
      return putInCache.call(room);
    }
    room.on('change', putInCache, room);
    return room;
  };
/**
 * this Factory should minimize calls to server for contacts information:
 * - any new cache model with ID defined will be fetched
 * - any model that doesn't have ID will be watched untill it get's the ID
 * - any collection will be watched untill it get's models with ID's and those will be saved 
 *   in cache
 */
module.exports = {
  getRoomModel: getRoomModel,
  getRoomsCollection: function(ids){
    var roomsArray = _(ids).map(function(id){
      return getRoomModel(id);
    });
    var collection = new RoomsCollection(roomsArray);
    collection.on('change', processCollection, collection);
    return collection;
  },

  getCurrentRoomId: function(){
    return currentRoomId;
  },

  setCurrentRoomId: function(roomId){
    currentRoomId = roomId;
  }
};

/**
 * on change of collection, get all elements and put them in chache if required
 */
function processCollection(){
  _(this.models).each(function(room){
    var modelId = room.get('id');
    if(!modelId) return;
    if(roomModelsCache[modelId]){
      return roomModelsCache[modelId].set(room.toJSON());
    }
    putInCache.call(room);
  });
}

function putInCache(){
  if(this.get('id')){
    roomModelsCache[this.get('id')] = this;
    this.off('change', putInCache);
  }
  return this;
}
