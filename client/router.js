var backbone = require('exoskeleton');
var router = backbone.Router.extend({
  routes: {
    '': 'main',
    'room/:id': 'room'
  },
  main: function () {

  },
  room: function (id){
    console.log('room', id);
  }
});
module.exports = new router();
