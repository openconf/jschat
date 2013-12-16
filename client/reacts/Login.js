/** @jsx React.DOM */
var Nav = require('./Nav.js');
module.exports = React.createClass({
  render: function(){
    return <div>
      <Nav />
      <div className="container">
        <div className="jumbotron">
          <h2>Login/signup chat</h2>
          <a className="btn btn-success" href='/auth/github' target="_self">Login with GitHub</a>
        </div>
      </div>
    </div>
  }
});
