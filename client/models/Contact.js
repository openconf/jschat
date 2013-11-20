var Exo = require('exoskeleton');

var Contact = Exo.Model.extend({
  urlRoot: "/api/users",
  initialize: function(){
    console.log("Initialize USERS");
  }
})

module.exports = Contact;
