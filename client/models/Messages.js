var Exo = require('exoskeleton');
var MessageModel = require('./Message');

var MessageCollection = Exo.Collection.extend({
  url: function(){
    return "/api/rooms/" + this.roomId + "/messages";
  },
  initialize: function(models, options){
    this.roomId = options.roomId;
  },
  model: MessageModel,
})

module.exports = MessageCollection;
