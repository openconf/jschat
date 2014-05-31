var Exo = require('exoskeleton');
var ContactFactory = require('./ContactFactory');
var _ = require('underscore');
var filters = require('../filters');

var Message = Exo.Model.extend({
  initialize: function(){
    this.set('is_new', true);

    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    if (this.get('tms')) this.date = new Date(+this.get('tms'));
    if (this.get('uid') && !this.__user) this.__user = ContactFactory.getContactModel(this.get('uid'));
    if (this.get('text')) this.text = _.reduce(filters, iterator, this.get('text'), this);    
  }
});

function iterator(memo, filter){
  return filter(memo);
}

module.exports = Message;
