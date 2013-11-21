var Exo = require('exoskeleton');

var Message = Exo.Model.extend({
  initialize: function(){
    this.transformData();
    this.formatMessage();
    this.on('change', this.transformData.bind(this));
    this.on('change', this.formatMessage.bind(this));
  },
  transformData: function(){
    if(this.get('_id')) this.date = new Date(parseInt(this.get('_id').slice(0,8), 16)*1000);
  },
  formatMessage: function(){
    if(!this.get('_id')) return;
    var dateString = [this.date.getHours(), this.date.getMinutes()].join(":");
    this.formattedMessage = "[" + dateString + "] " + (this.__user && this.__user.name) + ": " + this.get('text');
  },
  bindUser: function(user){
    this.__user = user;
    user.on('change', this.formatMessage.bind(this));
    this.formatMessage();
  }
})

module.exports = Message;
