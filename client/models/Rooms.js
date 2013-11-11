var Exo = require('exoskeleton');
var RoomModel = require('./Room');

var RoomCollection = Exo.Collection.extend({
  url: "/api/rooms",
  model: RoomModel,
  initialize: function(){
    console.log("Initialize Rooms");
  }
})

module.exports = new RoomCollection();
