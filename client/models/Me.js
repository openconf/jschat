var Exo = require('exoskeleton');

var Profile = Exo.Model.extend({
  url: "/api/me",
  initialize: function(){
    console.log("Initialize ME");
  }
})

module.exports = new Profile();
