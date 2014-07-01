/** @jsx React.DOM */
module.exports = React.createClass({
  render: function(){
    return <div className="wrapper">
      <ul className="chat">
        <li>
        Mac: <a href="/JSChat/mac/JSChat.dmg">JSChat.dmg</a>
        </li>
        <li>
        Win: <a href="/JSChat/win/JSChat.zip">JSChat.zip</a>
        </li>
        <li>
        Linux32: <a href="/JSChat/linux32/JSChat.tar.gz">JSChat.tar.gz</a>
        </li>
        <li>
        Linux64: <a href="/JSChat/linux64/JSChat.tar.gz">JSChat.tar.gz</a>
        </li>

      </ul>
    </div>
  }
});
