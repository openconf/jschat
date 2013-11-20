/** @jsx React.DOM */
var ContactModel = require('../models/Contact');

module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
  getBackboneModels : function(){
    return [this.props.user]
  },
  render: function(){
    var github = this.props.user && this.props.user.get('github');
    return <span className = "label label-default">
      {github && (github.displayName || '@' + github.username)}
    </span>
  }
});
