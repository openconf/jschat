/** @jsx React.DOM */
var notification = require('../services/notification');
var _ = require('underscore');

module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
  getBackboneModels : function(){
    return [this.props.room];
  },
  joinRoom: function(){
    notification.access()
    this.props.room.join({
      success: function(model, response){
        this.props.me.fetch()
        this.props.room.fetch()
      }.bind(this)
    });
  },
  meJoinedTheRoom: function(){
    return !!_(this.props.me.get('rooms')).find(function(id){
      return this.props.room.get('id') === id;
    }.bind(this));
  },
  leaveJoinButton: function(){
    if(this.meJoinedTheRoom()){
      return  <span>{" "}<button onClick={this.leaveRoom} className = "btn btn-default btn-xs">leave</button></span>;
    }
  },
  leaveRoom: function(){
    this.props.room.leave({
      success: function(model, response){
        this.props.me.fetch()
        this.props.room.fetch()
      }.bind(this)
    });
  },

  render: function(){
    return <div className="roomName"><strong>{this.props.room.get('name')}</strong> {this.leaveJoinButton()}: <small>{this.props.room.get('description')}</small> 
    </div>
  }
});

