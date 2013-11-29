/** @jsx React.DOM */
module.exports = React.createClass({
  render: function(){
    var user = function(meModel){
      if(meModel.get('id')){
        return <li>
          <a href="#" target="_self">{meModel.get('displayName') || meModel.get('gh_username')}</a>
        </li>;
      } else {
        return <li>
          <a href="/auth/github" target="_self">Login with GitHub</a>
        </li> 
      }
    }
    return <nav className="navbar navbar-default" role="navigation">
      <div className="navbar-header">
        <a className="navbar-brand" href="#" target="_self">JSchat</a>
      </div>
      <ul className="nav navbar-nav navbar-right">
        {user(this.props.me)}
      </ul>
    </nav>
  }
});
