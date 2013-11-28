var Exo = require('exoskeleton');

var Contact = Exo.Model.extend({
  urlRoot: "/api/users",
  initialize: function(){
    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    this.name = this.get('displayName') || '@' + this.get('gh_username');
  }
})

module.exports = Contact;
