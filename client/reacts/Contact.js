/** @jsx React.DOM */
var ContactModel = require('../models/Contact');

module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
  getBackboneModels : function(){
    return [this.props.user]
  },
  render: function(){
    var cn = parseInt(this.props.user.get('online'))?'online':'';
    return <div className = {cn}>
      <img src={this.props.user.get('gh_avatar')}/>
      <span className="status"></span>
      {this.props.user.name}
    </div>
  }
});
