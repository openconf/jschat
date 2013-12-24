var fs = require('fs');
var http = require('http');
var https = require('https');
var redis = require('redis');
var errors = require('./src/errors.js');
var APP_ENV = process.env.APP_ENV || 'development';

var redisUrl = require('parse-redis-url')(redis);
var options = redisUrl.parse(process.env.REDISTOGO_URL);
options.pass = options.password;

nconf = require('nconf');
nconf.argv()
     .env()
     .file({ file: __dirname + '/config/' + APP_ENV + '.config.json' });

nconf.set("server:port", nconf.get("server:port") || process.env.PORT);
nconf.set("server:hostname", nconf.get("server:port")?nconf.get("server:host") + ":" +  nconf.get("server:port") : nconf.get("host"));

// Setup app
var express = require('express');
var app = express();
var Store = require('connect-redis')(express);
var RedisStore = new Store(options);
console.log(options, '<<');
app.ms = RedisStore;
require('./src/middleware/authMiddleware.js')(app);

require('./src/middlewareSetup.js')(app);

//generate timelimited socket session token for session. 
// open sockets with engine.io
// rooms with engine.io-rooms
// reconnect with engine.io-reconnect


app.get('/config', app.access.free, function(req, res) {
  //TODO: cleanup config before sending back
  // better send only separate client-side configurtion
  res.send(nconf.get());
});

// Custom error handling
app.use(require('./src/middleware/errorHandling.js'));


// Start up the server on the port specified in the config
var server = http.createServer(app);
server.listen(nconf.get('server:port') );
console.log('Angular App Server - listening on port: ' + nconf.get('server:port'));
server.ms = RedisStore;
require('./src/socket/engine.js')(server);

