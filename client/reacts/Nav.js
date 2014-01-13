/** @jsx React.DOM */
module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
  getBackboneModels: function(){
    return [this.props.me]
  },
  render: function(){
    var that = this;
    var user = function(meModel){
      if(meModel && meModel.get('id')){
        return <li>
          <a href="#profile" target="_self">{meModel.get('displayName') || meModel.get('gh_username')}</a>
        </li>;
      } else {
        return <li>
          <a className='btn btn-default' href={window.host + "/auth/github?backUrl=" + encodeURIComponent(location.href)}  target="_self">Login with GitHub</a>
        </li> 
      }
    }
    return <nav className="navbar navbar-default" role="navigation">
      <div className="appName">
        <a className="navbar-brand" href="#" target="_self">JSchat</a>
      </div>
      
      <label htmlFor="handler-right" id="right" href="#" className="btn btn-default nav navbar-nav">⍣</label>
      <label htmlFor="handler-left" id="left" href="#" className="btn btn-default nav navbar-nav">☰</label>
      <ul className="nav navbar-nav" id="right">
        {user(this.props.me)}
      </ul>
    </nav>
  }
});
