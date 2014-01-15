/** @jsx React.DOM */
var ContactList = require('./ContactList');
var ParticipantsList = require('./ParticipantsList');
var ContactFactory = require('../models/ContactFactory');
var notification = require('../services/notification');

// item rendering im Messages list
var ScrollingList = require('./ScrollingList')(require('./Message.js'));

var MessageModel = require('../models/Message');
var backbone = require('exoskeleton');
var Nav = require('./Nav.js');
var _ = require('underscore');


var RoomName = require('./RoomName');

module.exports = React.createClass({
  handleTyping: function(evt){
    this.__textBoxValue = evt.target.value;
  },
  sendWriting: function(){
    if(this.__writing) return;
    this.__writing = true;
    this.props.messages.writing();
    setTimeout(function(){
      this.__writing = false;
    }.bind(this), 2000);
  },
  sendMessage: function(){
    this.props.messages.create(new MessageModel({
      text: this.__textBoxValue
      }),{
      success: function(){
        this.cleanTextBox();
        this.refs.messagesList.scrollToBottom(200);
        this.refs.messagesList.forceUpdate();
      }.bind(this)
    });
  },
  componentDidMount: function(){
    this.refresh();
  },
  componentDidUpdate: function(){
    this.refresh();
  },
  refresh: function(){
    this.props.room.fetch()
    this.props.rooms.fetch({attrs: {ids: this.props.me.get('rooms')}});
  },
  meJoinedTheRoom: function(){
    return !!_(this.props.me.get('rooms')).find(function(id){
      return this.props.room.get('id') === id;
    }.bind(this));
  },
  cleanTextBox: function(){
    this.refs.textbox.getDOMNode().value = '';
    this.__textBoxValue = '';
  },
  onKeyDown: function(e){
    if(e.keyCode === 13 && !e.shiftKey){
      if(!this.__textBoxValue || this.__textBoxValue == "\n") {
        return this.cleanTextBox();
      };
      return this.sendMessage();
    }
    this.sendWriting();
  },
  render: function(){
    return <div>
    <input type="checkbox" name="handler-right" className="handler" id="handler-right" />
    <input type="checkbox" name="handler-left" className="handler" id="handler-left" />
    <div className="wrapper">
      <ContactList rooms={this.props.rooms} room={this.props.room} me={this.props.me} />
      <div className="chat">
        <div className="info">
          <RoomName room = {this.props.room} me = {this.props.me}/>
          <ParticipantsList room={this.props.room}/>
        </div>
        <ScrollingList 
          renderedItems={this.props.messages}
          ref="messagesList"/>
      </div>
      <div className="form">
        <textarea onChange={this.handleTyping} 
          disabled={!this.meJoinedTheRoom()} 
          onKeyDown={this.onKeyDown} ref="textbox"></textarea>
      </div>
    </div>
  </div>
  }
})

