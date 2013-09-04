var _ = require('underscore');
var Room = require('../models').room;

module.exports = function(app){
  app.post('/api/rooms', createNewRoom);
  app.get('/api/rooms', getRooms);
}

function createNewRoom(req, res, next){
  // put room in DB
  // return room ID
  // accepts desctiption
  var newRoom = _(req.body).pick("description", "creator", "name");
  Room.create(newRoom, function(err, room){
    res.json(room);
  });
}

function getRooms(){}
