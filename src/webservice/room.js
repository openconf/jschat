var _ = require('underscore');
var Room = require('../models').room;

//TODO: make parameters check against injections

module.exports = function(app){
  app.post('/api/rooms', createNewRoom);
  app.get('/api/rooms/:id', getRoomById);
  app.get('/api/rooms', getRooms);
  app.put('/api/rooms/:id', updateRoomById);
  app.del('/api/rooms/:id', deleteRoomById);
}

function createNewRoom(req, res, next){

  var newRoom = _(req.body).pick("description", "name");
  newRoom.owner = req.user._id;

  Room.create(newRoom, function(err, room){
      res.json(room);
  });
}

function getRoomById(req, res, next){
    Room.getById(req.params.id, function(err, room){
        room ? res.json(room) : res.status(404).send('Not found');
    });
}

function getRooms(req, res, next) {
    Room.getAll(function(err, rooms){
        rooms && rooms.length ? res.json(rooms) : res.status(404).send('Not found');
    });
}

function updateRoomById(req, res, next){

    var updatedRoom = _(req.body).pick("description", "name");
    updatedRoom.owner = req.user._id;

    Room.updateById(req.params.id, updatedRoom, function(err, room){
        res.json(room);
    });
}

function deleteRoomById(req, res, next){
    Room.deleteById(req.params.id, function(err, count){
        res.json();
    });
}
