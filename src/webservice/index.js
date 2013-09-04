module.exports = function(app){
  
  require('./user.js')(app);
  require('./room.js')(app);
}
