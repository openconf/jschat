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
var TextBox = require('./TextBox');

var RoomName = require('./RoomName');

module.exports = React.createClass({
  displayName: "ChatRoom",
  componentDidMount: function(){
    this.handlers = [this.refs.partHandler.getDOMNode(),
     this.refs.roomsHandler.getDOMNode()];
    this.refresh();
  },
  componentDidUpdate: function(){
    this.refresh();
  },
  refresh: function(){
    this.props.room.fetch()
    this.props.rooms.fetch({attrs: {ids: this.props.me.get('rooms')}});
  },
  changed: function(e){
    if(!e.target.checked) return;
    this.handlers.forEach(function(item){
      if(item !== e.target) item.checked = false;
    }).
  },
  render: function(){
    var scrollingList = <ScrollingList 
          renderedItems={this.props.messages}
          ref="messagesList"/>;

    return <div>
    <input type="checkbox" name="handler-right" ref="partHandler" className="handler" id="handler-right" onChange={this.changed}/>
    <input type="checkbox" name="handler-left" ref="roomsHandler" className="handler" id="handler-left" onChange={this.changed}/>
    <div className="wrapper">
      <ContactList rooms={this.props.rooms} room={this.props.room} me={this.props.me} />
      <div className="chat">
        <div className="info">
          <RoomName room = {this.props.room} me = {this.props.me}/>
          <ParticipantsList room={this.props.room}/>
        </div>
        {scrollingList}
      </div>
      <TextBox me={this.props.me} room={this.props.room} messages={this.props.messages} list={scrollingList}/>
    </div>
  </div>
  }
})

