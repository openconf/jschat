/** @jsx React.DOM */
var backbone = require('exoskeleton');
var Me = require('./models/Me');
//var RoomModel = require('./models/Room');
var Rooms = require('./models/Rooms');
var notification = require('./services/notification');
var ContactFactory = require('./models/ContactFactory');

var processMessage;
module.exports = function(app){

  backbone.socket.addEventListener("message", function(data, type){
    try{
      data = JSON.parse(data);
    }catch(e){
      console.log('cant parse data', data);
    }
    if(processMessage){
      processMessage.call(this, data, type);
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
          var RoomFactory = require('./models/RoomFactory');
          
          var Messages = require('./models/Messages');
          var messages = new Messages(null, {roomId: id});
          
          app.bind('reconnected', function(){
            setTimeout(function(){messages.refresh();}, 500);
          });

          var room = new RoomFactory.getRoomModel(id);
          var component = React.renderComponent(<ChatRoom me={Me} 
            room = {room}
            messages = {messages}
            rooms = {new Rooms()} />,
          document.body.children[0]);
          component.refresh();
          room.switchto();
          //TODO: refactor
          processMessage = function(data, type){
            if(data.type == "WRITING" && id == data.rid){
              room.writing(data.uid);
              return;
            }
            if(data.type == "STATUS" && data.uid){
              var user = ContactFactory.getContactModel(data.uid);
              user.fetch();
              return;
            }
            if(data.action == "JOIN" || data.action == "LEAVE"){
              // todo: optimize
              room.fetch();
            }
            if(data.rid == id && messages && component){
              var model = messages.push(data);
              if(model.__user){
                var data = model.__user;
                // throw notification
                if(notification.shouldNotify()){
                  var note = notification.show(data.get('gh_avatar'), data.get('displayName') || data.get('gh_username'), model.get('text'));
                  // focus on window if notification is clicked
                  note.onclick = function(){
                    window.focus();
                  }
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

  return new router();
}
