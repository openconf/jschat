/** @jsx React.DOM */
var Contact = require('./Contact');

module.exports = React.createClass({
  render: function(){
    return <div className="participants">Participants<Contact/></div>
  }
});
