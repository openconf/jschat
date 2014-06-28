/** @jsx React.DOM */
module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
  getBackboneModels: function(){
    return [this.props.user]
  },
  render: function(){
    return <div>
      <div className="container">
        <h2>{this.props.user.name}</h2>
        <p>
          <img src={this.props.user.get('gh_avatar')}/>
        </p>
      </div>
  </div>
  }
});
