/** @jsx React.DOM */
var rooms = require('../models/Rooms');
var room = require('../models/Room');

var aRoom = function(data){
  return <div><a href={'#room/' + data._id} target="_self">{data.name}</a></div>
}
module.exports = React.createClass({
  fetchRooms: function(){
    rooms.fetch({
      success:function(model, data){
        this.setState({rooms: data.rooms})
      }.bind(this)
    })
  },
  getInitialState: function(){
    this.fetchRooms();
    return {
        rooms: [{
          name: "dummyRoomname",
          _id: 1
        },{
          name: "dummyRoomName2",
          _id: 2
        }]
      }
  },
  newRoomNameHandle: function(evt){
    this.newRoomName = evt.target.value;
  },
  createRoom: function(evt){
    rooms.create({
      name: this.newRoomName
    }, {
      success: function(model, roomData){
        var newRoom = new room(roomData);
        newRoom.join();
        this.fetchRooms();
      }.bind(this)
    });
  },
  render: function(){
    return <div>
      {this.state.rooms.map(aRoom)}
      <a href="#room/12">Go to test room</a>
      <input type="text" onChange = {this.newRoomNameHandle}/>
      <button onClick={this.createRoom}>Create</button>
    </div>
  }
});
