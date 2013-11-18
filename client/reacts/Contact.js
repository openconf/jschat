/** @jsx React.DOM */
module.exports = React.createClass({
  render: function(){
    return <div>
      <img src={this.props.pic}/>
      <span className={this.props.contact_status}></span>
      <span className="contactName">{this.props.contact_name}</span>
    </div>
  }
});
