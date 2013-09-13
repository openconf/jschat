var $ = require('jquery');
var template = require('./home.html');
$(".container").html(template);

var socket = require('engine.io')('ws://localhost:8080');

var inRoom = null;


socket.on('open', function () {
  $.ajax({
    url:"/api/me"
  }).done(function(data){
    $('.profile').html(data.github.displayName);
    socket.send(str({t:'authorization', user: data}));
  });

  socket.on('message', function (data) { 
    console.log(data);
  });
  socket.on('close', function () { });
});

$('.create').click(createRoom);
$('.join').click(joinRoom);
$('.submit').click(sendMsg);

function js(data){
  return JSON.parse(data);
}
function str(data){
  return JSON.stringify(data);
}

function sendMsg(){
  socket.send(str({t:'msg', r:inRoom, m: $('#chat').val()}))
}

function createRoom(){
  $.ajax({
    type:"POST",
    url:"/api/rooms",
    data:{name: $('#roomname').val()}
  }).done(function(data){
    $('#roomId').val(data._id);
    console.log(data);
  });
}


function joinRoom(){
  socket.send(str({t:'sys', r: $('#roomId').val(), m:"joinRoom"}));
  inRoom = $('#roomId').val();
}
