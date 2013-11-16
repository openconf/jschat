/** @jsx React.DOM */
var backbone = require('exoskeleton');
var Me = require('./models/Me');
//var RoomModel = require('./models/Room');

var router = backbone.Router.extend({
  routes: {
    '': 'main',
    'room/:id': 'room'
  },
  main: function () {
    var Home = require('./reacts/Home');
    React.renderComponent(<Home/>, document.body.children[0]);
  },
  room: function (id){
    console.log('room', id);
    Me.fetch({
      success: function(){
        var ChatRoom = require('./reacts/ChatRoom');
        var Room = require('./models/Room');
        var Messages = require('./models/Messages');
        var t = React.renderComponent(<ChatRoom me={Me} 
          room = {new Room({id : id})}
          messages = {new Messages(null, {roomId: id})}/>,
        document.body.children[0]);
      },
      error:function(model, err){
        var Login = require('./reacts/Login');
        React.renderComponent(<Login/>, document.body.children[0]);
      }
    });
  }
});
module.exports = new router();
