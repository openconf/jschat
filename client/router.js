/** @jsx React.DOM */
var backbone = require('exoskeleton');
var Me = require('./models/Me');
//var RoomModel = require('./models/Room');
var Rooms = require('./models/Rooms');
var ContactFactory = require('./models/ContactFactory');
var composer = require('composer')();

var processMessage;
module.exports = function(app){
  require('./messages')(app);
  composer.compose('layout', require('./reacts/Layout'));
  composer.compose('nav-bar', require('./reacts/Nav'), {me:Me});
  app.render();

 
  
  var router = backbone.Router.extend({
    routes: {
      '': 'main',
      'room/:id': 'room'
    },
    main: function () {
      var Home = require('./reacts/Home');
      Me.fetch();
      composer.compose('content', require('./reacts/Home'), {rooms: new Rooms(), me: Me});
      app.render();
    },
    room: function (id){
      composer.compose('room-props', {id: id});
      Me.fetch({success: gotProfile, error: gotProfile});
      function gotProfile(){
        if(Me.get('id')){
          var ChatRoom = require('./reacts/ChatRoom');
          var RoomFactory = require('./models/RoomFactory');
          
          var Messages = require('./models/Messages');
          
          app.bind('reconnected', function(){
            setTimeout(function(){messages.refresh();}, 500);
          });
 
          var room = new RoomFactory.getRoomModel(id);
          var messages = new Messages(null, {roomId: id});
          var rooms = new Rooms();
          
          var component = composer.compose('content', ChatRoom, {
            me:Me,
            room: room,
            messages: messages,
            rooms: rooms});
   
          composer.compose('room-props', {id: id, component: component, messages: messages, room: room});
          app.render();

        } else {
          composer.compose('content', require('./reacts/Login'));
          app.render();
        }
      }
    }
  });

  return new router();
}
