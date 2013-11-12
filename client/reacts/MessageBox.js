/** @jsx React.DOM */
var MessageModel = require('../models/Messages');

module.exports = React.createClass({
  getInitialState: function(){
    return {
        textBoxValue:''
      }
  },
  handleChange: function(evt){
    this.setState({textBoxValue: evt.target.value});
  },
  sendMessage: function(evt){
    var message = new MessageModel(null,{
      roomId: this.props.chat._id
    });
    message.create({
        text: this.state.textBoxValue
      },{
        success:function(){
          this.setState({textBoxValue:''});
        }.bind(this)
      }
    );
  },
  render: function(){
    return <div>
      <textarea onChange = {this.handleChange} value={this.state.textBoxValue}></textarea>
      <button  onClick={this.sendMessage}>send</button>
    </div>
  }
})
