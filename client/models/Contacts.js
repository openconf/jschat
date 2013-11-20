var Exo = require('exoskeleton');
var ContactModel = require('./Contact');

var ContactsCollection = Exo.Collection.extend({
  url: "/api/users",
  model: ContactModel,
  initialize: function(){
    console.log("Initialize ContactsCollection");
  }
})

module.exports = ContactsCollection;
