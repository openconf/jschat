/** @jsx React.DOM */
module.exports = React.createClass({
  render: function(){
    var that = this;
    var user = function(meModel){
      if(meModel && meModel.get('id')){
        return <li>
          <a href="#" target="_self">{meModel.get('displayName') || meModel.get('gh_username')}</a>
        </li>;
      } else {
        return <li>
          <a href={window.host + "/auth/github?backUrl=" + encodeURIComponent(location.href)}  target="_self">Login with GitHub</a>
        </li> 
      }
    }
    return <nav className="navbar" role="navigation">
        <a className="navbar-brand" href="#" target="_self">JSchat</a>
      <ul className="nav right">
        <li><label htmlFor="handler-right" id="right" href="#">Open right →</label></li>
<li><label htmlFor="handler-left" id="left" href="#">← Open left</label></li>
        {user(this.props.me)}
      </ul>
    </nav>
  }
});
