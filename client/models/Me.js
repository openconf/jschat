var Exo = require('exoskeleton');

var Profile = Exo.Model.extend({
  urlRoot: "/api/me",
  initialize: function(){
    console.log("Initialize");
  }
})

module.exports = new Profile();
