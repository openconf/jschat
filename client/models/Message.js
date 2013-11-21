var Exo = require('exoskeleton');
var ContactFactory = require('./ContactFactory');

var Message = Exo.Model.extend({
  initialize: function(){
    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    if(this.get('_id')) this.date = new Date(parseInt(this.get('_id').slice(0,8), 16)*1000);
    if(this.get('uid') && !this.__user) this.__user = ContactFactory.getContactModel(this.get('uid'));
  }
})

module.exports = Message;
