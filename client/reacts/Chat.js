/** @jsx React.DOM */
var ParticipantsList = require('./ParticipantsList');
var MessagesList = require('./MessagesList');
var MessageBox = require('./MessageBox');

module.exports = React.createClass({
  render: function(){
    return <div>
      <ParticipantsList/>
      <MessagesList/>
      <MessageBox/>
    </div>;
  }
})
