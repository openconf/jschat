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
    this.refresh();
  },
  componentDidUpdate: function(){
    this.refresh();
  },
  refresh: function(){
    this.props.room.fetch()
    this.props.rooms.fetch({attrs: {ids: this.props.me.get('rooms')}});
  },
  render: function(){
    var scrollingList = <ScrollingList 
          renderedItems={this.props.messages}
          ref="messagesList"/>;

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
        {scrollingList}
      </div>
      <TextBox me={this.props.me} room={this.props.room} messages={this.props.messages} list={scrollingList}/>
    </div>
  </div>
  }
})

