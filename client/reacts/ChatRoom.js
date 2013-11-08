/** @jsx React.DOM */
var ContactList = require('./ContactList');
var Chat = require('./Chat');

module.exports = React.createClass({
  render: function(){
    console.log(this.props.me.get('github').displayName);
    return <div>
      <div>Hi, {this.props.me.get('github').displayName}</div>
      <ContactList/>
      <Chat/>
    </div>
  }
})
