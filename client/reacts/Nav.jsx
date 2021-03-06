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
	  <a className='' onClick={function(){localStorage.auth=true}} href={window.host + "/auth/github?backUrl=" + encodeURIComponent(location.href)}  target="_self">Login with GitHub</a>
	</li>
      }
    }
    var download;
    if(!isDesktop){
      download = <li><a href="#download">Download</a></li>;
    }
    return <nav className="navbar navbar-default" role="navigation">
      <div className="appName">
	       <a className="navbar-brand" href="#" target="_self">JSchatッ<small> {window.pkg && window.pkg.version}</small></a> 
      </div>

      <label htmlFor="handler-right" id="right" href="#" className="btn btn-default nav navbar-nav">⍣</label>
      <label htmlFor="handler-left" id="left" href="#" className="btn btn-default nav navbar-nav">☰</label>
      <ul className="nav navbar-nav" id="right">
	     {download}
	     {user(this.props.me)}
      </ul>
    </nav>
  }
});
