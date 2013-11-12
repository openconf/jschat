/** @jsx React.DOM */
var ParticipantsList = require('./ParticipantsList');
var MessagesList = require('./MessagesList');
var MessageBox = require('./MessageBox');


var Messages = MessagesList(function(item){
  return <div>{item.text}</div>
})

module.exports = React.createClass({
  render: function(){
    console.log(this.props);
    return <div>
      <ParticipantsList/>
      <Messages items={this.props.messages}/>
      <MessageBox chat={this.props.chat}/>
    </div>;
  }
})
