/** @jsx React.DOM */
var ContactModel = require('../models/Contact');

module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
  getBackboneModels : function(){
    return [this.props.user]
  },
  render: function(){
    return <span className = "label label-default">
      {this.props.user.name}
    </span>
  }
});
