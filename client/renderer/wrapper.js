/** @jsx React.DOM */
module.exports = function(wrapThat){
  return React.createClass({
    render: function(){
      return <div onClick={this.props.trapClick}>
        {wrapThat}
      </div>
    }
  });
}
