var mongojs = require('mongojs');
var collections = ['user', 'room'];

var db = mongojs(nconf.get('mongo:url') + nconf.get('mongo:db'), collections);
module.exports = (function(){
  var models = {};

  collections.forEach(function(collection){
    models[collection] = require('./'+ collection)(db);
  });
  return models;
})();
