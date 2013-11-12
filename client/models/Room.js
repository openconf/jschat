var Exo = require('exoskeleton');

var Room = Exo.Model.extend({
  urlRoot: "/api/rooms",
  initialize: function(){
    console.log("Initialize Room");
  },
  join: function(){
    this.sync('join', this, {url: this.urlRoot + '/' + this.get('_id')});
  }
})

module.exports = Room;
