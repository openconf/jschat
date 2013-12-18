/** @jsx React.DOM */
var ContactList = require('./ContactList');
var ParticipantsList = require('./ParticipantsList');
var ContactFactory = require('../models/ContactFactory');
var notification = require('../services/notification');

// item rendering im Messages list
var MessagesList = require('./MessagesList')(require('./Message.js'));

var MessageModel = require('../models/Message');
var backbone = require('exoskeleton');
var Nav = require('./Nav.js');
var _ = require('underscore');


module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
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
  joinRoom: function(){
    notification.access()
    this.props.room.join({
      success: function(model, response){
        this.props.me.fetch()
        this.props.room.fetch()
      }.bind(this)
    });
  },
  leaveRoom: function(){
    this.props.room.leave({
      success: function(model, response){
        this.props.me.fetch()
        this.props.room.fetch()
      }.bind(this)
    });
  },
  getBackboneModels : function(){
    return [
            this.props.room,
            this.props.rooms,
            this.props.me
            ]
  },
  refresh: function(){
    this.props.room.fetch()
    this.props.rooms.fetch({attrs: {ids: this.props.me.get('rooms')}});
    this.props.messages.fetch({
      success: function(){
        this.refs.messagesList.scrollToBottom();
      }.bind(this)
    })
  },
  meJoinedTheRoom: function(){
    return !!_(this.props.me.get('rooms')).find(function(id){
      return this.props.room.get('id') === id;
    }.bind(this));
  },
  leaveJoinButton: function(){
    if(this.meJoinedTheRoom()){
      return <button onClick={this.leaveRoom}>leave</button>;
    } else {
      return <button onClick={this.joinRoom}>join</button>;
    }
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
      this.sendMessage();
    }
    this.sendWriting();
  },
  render: function(){
    return <div>
    <Nav me={this.props.me}/>
    <div className="container">
      <div className="row">
        <ContactList rooms={this.props.rooms} room={this.props.room} me={this.props.me} />
        <div className="chat col-md-9 com-sm-7">
          <div>{this.props.room.get('name')} {this.leaveJoinButton()}</div>
          <ParticipantsList room={this.props.room}/>
          <MessagesList 
            messages={this.props.messages}
            ref="messagesList" 
            writingStatus = {writingStatus(this.props.room.get('writing_users'))}/>
          <div className="form">
            <textarea onChange={this.handleTyping} 
              disabled={!this.meJoinedTheRoom()} 
              onKeyDown={this.onKeyDown} ref="textbox"></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
  }
})

function writingStatus(usersWrite){
  return <span>
    {usersWrite && usersWrite.map(renderUserWrite)}
    {usersWrite && !_(usersWrite).isEmpty() && " typing ..."}
  </span>
}

function renderUserWrite(user, i){
  return <span>{i !== 0 && ','}{user.name}</span>
}
