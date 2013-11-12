/** @jsx React.DOM */
var ContactList = require('./ContactList');
var Chat = require('./Chat');
var RoomModel = require('../models/Room');
var MessagesCollection = require('../models/Messages');

module.exports = React.createClass({
  getChat: function(){
    var room = new RoomModel({id:this.props.roomId});
    room.fetch({
      success:function(model, room){
        this.setState({chat: room});
      }.bind(this)
    })
  },
  getMessages: function(){
    var messages = new MessagesCollection([], {roomId: this.props.roomId});
    var that = this;
    messages.fetch({
      success: function(model, data){
        console.log(data);
        that.setState({messages: data.messages});
      }
    })
  },
  getInitialState: function(){
    this.getChat();
    this.getMessages();
    return {
      chat: {
        id: this.props.roomId
      },
      messages: [],
      me: this.props.me
    }
  },
  render: function(){
    return <div>
      <div>Hi, {this.props.me.get('github').displayName}</div>
      <h3>{this.state.chat.name}</h3>
      <ContactList/>
      <Chat chat = {this.state.chat} messages = {this.state.messages}/>
    </div>
  }
})
