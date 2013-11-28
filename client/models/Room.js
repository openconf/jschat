var Exo = require('exoskeleton');
var _ = require('underscore');

var Room = Exo.Model.extend({
  urlRoot: "/api/rooms",
  initialize: function(){
    console.log("Initialize Room");
  },
  join: function(opts){
    opts = _({url: this.urlRoot + '/' + this.get('id')}).extend(opts);
    this.sync('join', this, opts);
  },
  leave: function(opts){
    opts = _({url: this.urlRoot + '/' + this.get('id')}).extend(opts);
    this.sync('leave', this, opts);
  }
})

module.exports = Room;
