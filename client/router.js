/** @jsx React.DOM */
var backbone = require('exoskeleton');
var MeModel = require('./models/Me');
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
    var me = new MeModel();
    me.fetch({
      success: function(){
        console.log(arguments);
      },
      error:function(model, err){
        var Login = require('./reacts/Login');
        React.renderComponent(<Login/>, document.body.children[0]);
      }
    });
    
    var ChatRoom = require('./reacts/ChatRoom');
    var t = React.renderComponent(<ChatRoom/>, document.body.children[0]);
    console.log(t);
  }
});
module.exports = new router();
