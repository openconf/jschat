/** @jsx React.DOM */
var ContactList = require('./ContactList');
var Chat = require('./Chat');

module.exports = React.createClass({
  render: function(){
    return <div>
      <ContactList/>
      <Chat/>
    </div>
  }
})
