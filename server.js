var fs = require('fs');
var http = require('http');
var https = require('https');
var errors = require('./src/errors.js');
var APP_ENV = process.env.APP_ENV || 'development';

nconf = require('nconf');
nconf.argv()
     .env()
     .file({ file: './config/' + APP_ENV + '.config.json' });


// Setup app
var express = require('express');
var app = express();

require('./src/middleware/authMiddleware.js')(app);

require('./src/middlewareSetup.js')(app);

//require('./src/webservices')(app);

app.get('/config', app.access.free, function(req, res) {
  //TODO: cleanup config before sending back
  // better send only separate client-side configurtion
  res.send(nconf.get());
});

// Custom error handling
app.use(require('./src/middleware/errorHandling.js'));


// Start up the server on the port specified in the config
var server = http.createServer(app);
server.listen(nconf.get('server:port'));
console.log('Angular App Server - listening on port: ' + nconf.get('server:port'));


