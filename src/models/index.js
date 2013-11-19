var mongojs = require('mongojs');
var collections = ['user', 'room', 'message'];

var db = mongojs(nconf.get('mongo:url')||process.env.MONGOLAB_URI + nconf.get('mongo:db'), collections);
console.log(nconf.get('mongo:url')||process.env.MONGOLAB_URI + nconf.get('mongo:db'))
module.exports = (function(){
  var models = {};

  collections.forEach(function(collection){
    models[collection] = require('./'+ collection)(db);
    models[collection].drop = function(cb){
      db[collection].drop(cb);
    }
  });
  return models;
})();
