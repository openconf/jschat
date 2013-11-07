var Exo = require('exoskeleton');

module.exports = Exo.Model.extend({
  urlRoot: "/api/me",
  initialize: function(){
    console.log("Initialize");
  }
})
