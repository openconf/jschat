var Exo = require('exoskeleton');

var Profile = Exo.Model.extend({
  url: "/api/me",
  initialize: function(){
    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    this.name = this.get('displayName') || '@' + this.get('gh_username');
  }
})

module.exports = new Profile();
