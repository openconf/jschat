/** @jsx React.DOM */
var RoomsModel = require('../models/Rooms');
var room = require('../models/Room');
var rooms = new RoomsModel();
var aRoom = function(data){
  return <div className = "col-xs-3">
    <div className="chat-badge">
      <h4><a href={'#room/' + data.id} target="_self">{data.name}</a></h4>
      <small>{data.description}</small>
    </div>
  </div>
  }
  var Nav = require('./Nav.js');

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
  newRoomDescHandle: function(evt){
    this.newRoomDesc = evt.target.value;
  },
  createRoom: function(evt){
    this.props.rooms.create({
      name: this.newRoomName,
      description: this.newRoomDesc
    }, {
      success: function(model, roomId){
        var newRoom = new room({id:roomId});
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
    console.log(this.props.me);
    return <div>
      <Nav me={this.props.me}/>
      <div className="container">
        <div className = "row">
          {this.state.rooms.map(aRoom)}
        </div>
        <div className= "form-group col-xs-6">
          <h4>create new room</h4>
          <input type="text" className="form-control" onChange = {this.newRoomNameHandle} placeholder="name"/>
          <br/>
          <textarea className = "form-control" placeholder="description" onChange = {this.newRoomDescHandle}/>
          <br/>
          <button onClick={this.createRoom} className="btn btn-success" disabled={!this.props.me.get('id')}>Create</button>
        </div>
      </div>
  </div>
  }
});
