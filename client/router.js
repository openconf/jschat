/** @jsx React.DOM */
var backbone = require('exoskeleton');
var Me = require('./models/Me');
//var RoomModel = require('./models/Room');
var Rooms = require('./models/Rooms');
var notification = require('./services/notification');
var processMessage;
backbone.socket.addEventListener("message", function(data){
  try{
    data = JSON.parse(data);
  }catch(e){
    console.log('cant parse data', data);
  }
  if(processMessage){
    processMessage.call(this, data);
  }
});
var router = backbone.Router.extend({
  routes: {
    '': 'main',
    'room/:id': 'room'
  },
  main: function () {
    var Home = require('./reacts/Home');
    Me.fetch();
    React.unmountComponentAtNode(document.body.children[0]);
    React.renderComponent(<Home me={Me} rooms={new Rooms()}/>, document.body.children[0]);
  },
  room: function (id){
    Me.fetch({success: gotProfile, error: gotProfile});
    function gotProfile(){
      if(Me.get('id')){
        React.unmountComponentAtNode(document.body.children[0]);
        var ChatRoom = require('./reacts/ChatRoom');
        var Room = require('./models/Room');
        
        var Messages = require('./models/Messages');
        var messages = new Messages(null, {roomId: id});

        var component = React.renderComponent(<ChatRoom me={Me} 
          room = {new Room({id : id})}
          messages = {messages}
          rooms = {new Rooms()} />,
        document.body.children[0]);
        component.refresh();

        processMessage = function(data){
          if(data._rid == id && messages && component){
            var model = messages.push(data);
            if(model.__user && model.__user.get('github')){
              var data = model.__user.get('github');
              // throw notification
              if(notification.shouldNotify()){
                var note = notification.show(data._json.avatar_url, data.displayName || data.username, model.get('text'));
                if(note){
                  setTimeout(function(){
                    note.cancel();
                  }, 2000);
                }
              }
            }
            component.refs.messagesList.scrollToBottom();
          }
        }

      } else {
        var Login = require('./reacts/Login');
        React.renderComponent(<Login/>, document.body.children[0]);
      }
    }
  }
});
module.exports = new router();
