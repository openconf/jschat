/** @jsx React.DOM */
var Contact = require('./Contact');
var ContactFactory = require('../models/ContactFactory');

var ContactItem = function(item){
  var user = ContactFactory.getContactModel(item);
  return <Contact user = {user}/>;
}

module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
  getBackboneModels: function(){
    return [this.props.room]
  },
  render: function(){
    var participants = this.props.room.toJSON();
    participants.users = participants.users||[];
    return <div className="participants">{participants.users.map(ContactItem)}</div>
  }
});
