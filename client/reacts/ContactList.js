/** @jsx React.DOM */
var _ = require('underscore');
//var Contact = require('./Contact');
var roomContact = function(data){
  return <div className={data.current && "current"}>
    <a href={'#room/' + data._id} target="_self">{data.name}</a>
  </div>
}

module.exports = React.createClass({
  render: function(){
    var rooms = this.props.rooms.toJSON();
    var roomId = this.props.room.get('id');
    var currentRoom = _.findWhere(rooms, {_id: roomId});
    currentRoom && (currentRoom.current = true);
    return <div className="col-sm-4 col-md-2 contactList">
      <h3>Rooms</h3>
      {rooms.map(roomContact)}
    </div>
  }
})
