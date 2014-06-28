/** @jsx React.DOM */
module.exports = React.createClass({
  mixins: [require('composer').mixin],
  render: function(){
    return <div>
      {this.insert('nav-bar')}
      <div>
	{this.insert('content')}
      </div>
    </div>
  }
});
