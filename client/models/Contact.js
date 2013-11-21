var Exo = require('exoskeleton');

var Contact = Exo.Model.extend({
  urlRoot: "/api/users",
  initialize: function(){
    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    var github = this.get('github');
    this.name = github && (github.displayName || '@' + github.username);
  }
})

module.exports = Contact;
