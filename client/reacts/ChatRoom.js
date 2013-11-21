/** @jsx React.DOM */
var ContactList = require('./ContactList');
var ParticipantsList = require('./ParticipantsList');
var ContactFactory = require('../models/ContactFactory');
var MessagesList = require('./MessagesList')(function(item){
  if(!item.get('_id')) return;
    return <div className='msg'>{item.formattedMessage}</div>
  });
var MessageModel = require('../models/Message');
var backbone = require('exoskeleton');
var Nav = require('./Nav.js');
var _ = require('underscore');


module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
  handleTyping: function(evt){
    this.__textBoxValue = evt.target.value;
  },
  sendMessage: function(){
    this.props.messages.create(new MessageModel({
      text: this.__textBoxValue
      }),{
      success: function(){
        this.refs.textbox.getDOMNode().value = '';
        this.refs.messagesList.scrollToBottom(200);
        this.refs.messagesList.forceUpdate();
      }.bind(this)
    });
  },
  joinRoom: function(){
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
  onKeyDown: function(e){
    if(e.keyCode === 13 && !e.shiftKey){
      this.sendMessage()
    }
  },
  render: function(){
    return <div><Nav me={this.props.me}/>
    <div className="container">
      <h3>{this.props.room.get('name')} {this.leaveJoinButton()}</h3>
      <div className="row">
        <ContactList rooms={this.props.rooms} room={this.props.room}/>
        <div className="chat col-md-9 com-sm-7">
          <ParticipantsList room={this.props.room}/>
          <MessagesList  
            messages={this.props.messages} 
            ref="messagesList" />
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


