/** @jsx React.DOM */
var RoomsModel = require('../models/Rooms');
var room = require('../models/Room');
var rooms = new RoomsModel();
var ContactFactory = require('../models/ContactFactory');

var renderUsers = function(uid){
  var user = ContactFactory.getContactModel(uid);
  this.injectModel(user);
  return <img src = {user.get('gh_avatar')} title={user.name}/>
}

var aRoom = function(data){
  var users = data.participants.slice(-10);
  return <div className = "col-xs-3">
    <div className="chat-badge">
      <h4><a href={'#room/' + data.id} target="_self">{data.name}</a></h4>
      <small>{data.description}</small>
      <div>{users.map(renderUsers, this)}</div>
    </div>
  </div>
}

var Nav = require('./Nav.js');

module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
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
        document.location = "#room/" + roomId;
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
      <Nav me={this.props.me}/>
      <div className="container">
        <div className = "row">
          {this.state.rooms.map(aRoom, this)}
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
