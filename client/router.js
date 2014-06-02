/** @jsx React.DOM */

var backbone = require('exoskeleton');
var Me = require('./models/Me');
var Rooms = require('./models/Rooms');
var ContactFactory = require('./models/ContactFactory');
var composer = require('composer')();
var Storage = require('./services/storage');
var processMessage;

/*
TODO: refactoring of router:
1) router should support async middlewares as in express (let's take page.js, drop ie<10)
2) those urls that require /Me should have it, we can route if something goes wrong
3) It would be great to cover the page with spinner
*/



module.exports = function(app){
  require('./messages')(app);
  composer.compose('layout', require('./reacts/Layout'));
  composer.compose('nav-bar', require('./reacts/Nav'), {me:Me});
  Me.fetch();
  app.render();

if(isDesktop && localStorage.auth){ //desktop driven hack
  delete localStorage.auth;
  location.assign(window.host + '/auth/github?backUrl=' + encodeURIComponent(location.href)); 
} else {
  delete localStorage.auth;
}

  var router = backbone.Router.extend({
    routes: {
      '': 'main',
      'room/:id': 'room',
      'user/:id': 'profile',
      'profile': 'profile',
      'download': 'download'
    },
    main: function () {
      Me.fetch();
      console.log(Me);
      composer.compose('content', require('./reacts/Home'), {rooms: new Rooms(), me: Me});
      app.render();
    },
    download: function(){
      composer.compose('content', require('./reacts/Download'));
      app.render();
    },
    profile: function(id){
      var user;
      user = (id === undefined) ? Me : ContactFactory.getContactModel(id);
      user.fetch();
      composer.compose('content', require('./reacts/Profile'), {user: user});
      app.render();
    },
    room: function (id){
      // todo: use single room-props
      composer.compose('room-props:' + id, {id: id});
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
          var messages = new Messages((new Storage(id)).getLast(20), {roomId: id});
          var rooms = new RoomFactory.getRoomsCollection(Me.get('rooms'));

          var component = composer.compose('content', ChatRoom, {
            me:Me,
            room: room,
            messages: messages,
            rooms: rooms});
          room.switchto();
          // todo: use single room-props
          composer.compose('room-props', {id: id, component: component, messages: messages, room: room, rooms: rooms});
          composer.compose('room-props:' + id, {id: id, component: component, messages: messages, room: room, rooms: rooms});
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
