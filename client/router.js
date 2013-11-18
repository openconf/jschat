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
        React.unmountComponentAtNode(document.body.children[0]);
        var ChatRoom = require('./reacts/ChatRoom');
        var Room = require('./models/Room');
        var Rooms = require('./models/Rooms');
        var Messages = require('./models/Messages');
        var messages = new Messages(null, {roomId: id});


        var component = React.renderComponent(<ChatRoom me={Me} 
          room = {new Room({id : id})}
          messages = {messages}
          rooms = {new Rooms()} />,
        document.body.children[0]);
        component.refresh();
        backbone.socket.addEventListener("message", function(data){
          try{
            data = JSON.parse(data);
          }catch(e){
            console.log('cant parse data', data);
          }
          if(data._rid == id){
            messages.push(data);
            component.refs.messagesList.scrollToBottom();
          }
        });
      },
      error:function(model, err){
        var Login = require('./reacts/Login');
        React.renderComponent(<Login/>, document.body.children[0]);
      }
    });
  }
});
module.exports = new router();
