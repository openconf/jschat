process.on("uncaughtException", function(e) { 
	console.log("_____________uncaughtException_____________"); 
	console.error(e);
	console.log("_____________/////////////////_____________"); 
});

module.exports = {
	updateDaemon: require('./updateDaemon'),
	autolaunchDaemon: require('./autolaunchDaemon')
}

