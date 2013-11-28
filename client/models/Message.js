var Exo = require('exoskeleton');
var ContactFactory = require('./ContactFactory');

var Message = Exo.Model.extend({
  initialize: function(){
    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    if(this.get('tms')) this.date = new Date(this.get('tms'));
    if(this.get('uid') && !this.__user) this.__user = ContactFactory.getContactModel(this.get('uid'));
  }
})

module.exports = Message;
