/** @jsx React.DOM */
var ContactList = require('./ContactList');
var ParticipantsList = require('./ParticipantsList');
var MessagesList = require('./MessagesList')(function(item){
    return <div className='msg'>{item.text}</div>
  });
var MessageModel = require('../models/Message');
var backbone = require('exoskeleton');
var _ = require('underscore');


module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
  getInitialState: function(){
    return {
      textBoxValue: ''
    }
  },
  handleTyping: function(evt){
    this.setState({textBoxValue: evt.target.value});
  },
  sendMessage: function(){
    this.props.messages.create(new MessageModel({
      text: this.state.textBoxValue
      }),{
      success: function(){
        this.setState({textBoxValue:''});
        this.refs.messagesList.scrollToBottom(200);
      }.bind(this)
    });
  },
  joinRoom: function(){
    this.props.room.join({
      success: function(model, response){
        this.props.me.fetch()
      }.bind(this)
    });
  },
  leaveRoom: function(){
    this.props.room.leave({
      success: function(model, response){
        this.props.me.fetch()
      }.bind(this)
    });
  },
  getBackboneModels : function(){
    return [
            this.props.room,
            this.props.messages,
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
  render: function(){
    var rawMessages = this.props.messages && 
      this.props.messages.toJSON();
    rawMessages = rawMessages  || [];
    return <div className="container">
      <div>Hi, {this.props.me.get('github').displayName}</div>
      <h3>{this.props.room.get('name')} <button onClick={this.joinRoom}>join</button>
                  <button onClick={this.leaveRoom}>leave</button>
      </h3>
      <div className="row">
        <ContactList rooms={this.props.rooms} room={this.props.room}/>
        <div className="chat col-md-9 com-sm-7">
          <ParticipantsList className="participants" />
          <MessagesList items={rawMessages} ref="messagesList" />
          <div className="form">
            <textarea onChange={this.handleTyping} 
                  value={this.state.textBoxValue} 
                  disabled={!this.meJoinedTheRoom()}></textarea>
            <button onClick={this.sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>

  }
})


