var Exo = require('exoskeleton');

var Room = Exo.Model.extend({
  urlRoot: "/api/rooms",
  initialize: function(){
    console.log("Initialize Room");
  }
})

module.exports = Room;
