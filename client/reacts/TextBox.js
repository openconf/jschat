/** @jsx React.DOM */
var MessageModel = require('../models/Message');
var _ = require('underscore');
var notification = require('../services/notification');

module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
  getBackboneModels: function(){
    return [this.props.room,
            this.props.me,
            this.props.messages]
  },
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
        this.props.list.scrollToBottom(200);
        this.props.list.forceUpdate();
      }.bind(this)
    });
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
  join: function(){
    if(this.meJoinedTheRoom()) return;
    notification.access()
    this.props.room.join({
      success: function(model, response){
        this.props.me.fetch()
        this.props.room.fetch({
          success:function(){
            this.refs.textbox.getDOMNode().focus();
          }.bind(this)
        })
      }.bind(this)
    });
  },
  render: function(){
    return <div className="form">
      <div className={!this.meJoinedTheRoom()?"text disabled":"text"} onClick={this.join}><textarea onChange={this.handleTyping}
      disabled={!this.meJoinedTheRoom()}
      onKeyDown={this.onKeyDown} ref="textbox"></textarea></div>
    </div>
  }
})
