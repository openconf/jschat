var Exo = require('exoskeleton');

var Message = Exo.Model.extend({
  initialize: function(){
    console.log("Initialize Room");
  }
})

module.exports = Message;
