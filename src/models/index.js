var redis = require('redis');

var redisUrl = require('parse-redis-url')(redis);
var options = redisUrl.parse(process.env.REDIS_URL);
var client;


function strongConnect(){
  client = redis.createClient(options.port, options.host);
  client.on('error', function(err){
    console.log("global redis error: " + err);
    strongConnect();
  });


  if(options.password){
    client.auth(options.password, function(err){
      console.log(err);
    })
  }

  if(!process.env.REDIS_URL){
    client.select(options.database || nconf.get('redis:db'), function(){});
  }
  if(module.exports){
    module.exports.db = client;
  }
}
strongConnect()

module.exports = {
  user : require('./user.js')(client),
  room : require('./room.js')(client),
  message: require('./message.js')(client),
  db : client
}
