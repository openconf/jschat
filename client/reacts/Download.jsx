/** @jsx React.DOM */
module.exports = React.createClass({
  render: function(){
    return <div className="wrapper">
      <ul className="chat">
        <li>
        Mac: <a href="https://raw.githubusercontent.com/openconf/jschatapp/master/JSChat/osx/JSChat.zip">JSChat.zip</a>
        </li>
        <li>
        Win: <a href="https://raw.githubusercontent.com/openconf/jschatapp/master/JSChat/win/JSChat.zip">JSChat.zip</a>
        </li>
        <li>
        Linux32: <a href="https://raw.githubusercontent.com/openconf/jschatapp/master/JSChat/linux32/JSChat.tar.gz">JSChat.tar.gz</a>
        </li>
        <li>
        Linux64: <a href="https://raw.githubusercontent.com/openconf/jschatapp/master/JSChat/linux64/JSChat.tar.gz">JSChat.tar.gz</a>
        </li>

      </ul>
    </div>
  }
});
