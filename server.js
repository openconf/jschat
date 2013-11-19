var fs = require('fs');
var http = require('http');
var https = require('https');
var errors = require('./src/errors.js');
var APP_ENV = process.env.APP_ENV || 'development';

nconf = require('nconf');
nconf.argv()
     .env()
     .file({ file: __dirname + '/config/' + APP_ENV + '.config.json' });

nconf.set("server:hostname", nconf.get("server:port")?nconf.get("server:host") + ":" +  nconf.get("server:port") : nconf.get("host"));

// Setup app
var express = require('express');
var app = express();
var MemoryStore = new express.session.MemoryStore();
app.ms = MemoryStore;
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
server.listen(nconf.get('server:port') || process.env.PORT);
console.log('Angular App Server - listening on port: ' + nconf.get('server:port'));
server.ms = MemoryStore;
require('./src/socket/engine.js')(server);

