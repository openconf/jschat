/** @jsx React.DOM */
var RoomsModel = require('../models/Rooms');
var room = require('../models/Room');
var rooms = new RoomsModel();
var aRoom = function(data){
  return <div><a href={'#room/' + data._id} target="_self">{data.name}</a></div>
}
module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
  getBackboneModels: function(){
    return [this.props.rooms, this.props.me]
  },
  getInitialState: function(){
    return {
        rooms: []
      }
  },
  newRoomNameHandle: function(evt){
    this.newRoomName = evt.target.value;
  },
  createRoom: function(evt){
    this.props.rooms.create({
      name: this.newRoomName
    }, {
      success: function(model, roomData){
        var newRoom = new room(roomData);
        newRoom.join();
        this.fetchRooms();
      }.bind(this)
    });
  },
  fetchRooms: function(){
    this.props.rooms.fetch({
      success:function(model, data){
        this.setState({rooms: data})
      }.bind(this)
    });
  },
  componentDidMount: function(){
    this.fetchRooms();
  },
  render: function(){
    return <div>
      {this.state.rooms.map(aRoom)}
      <input type="text" onChange = {this.newRoomNameHandle}/>
      <button onClick={this.createRoom}>Create</button>
    </div>
  }
});
