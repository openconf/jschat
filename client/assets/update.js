if(window.require){//that means that we are inside node-webkit
var updater = require('node-webkit-updater');

var gui = require('nw.gui');
var pkg = require('./package.json');
var copyPath, execPath;
var upd = new updater(pkg);
var newVersionCheckIntervalId = null;
var tryingForNewVersion = false;
var isDownloading = false;

if(gui.App.argv.length){
	copyPath = gui.App.argv[0];
	execPath = gui.App.argv[1];
	window.isInstaller = true;
}

if(!copyPath){
	newVersionCheckIntervalId = setInterval(function(){
		if(!isDownloading && !tryingForNewVersion) {
          tryingForNewVersion = true; //lock
          upd.checkNewVersion(versionChecked);
        }
      }, 500);
}else{
	upd.install(copyPath, newAppInstalled);

	function newAppInstalled(err){
		if(err){
			console.log(err);
			return;
		}
		upd.run(execPath, null);
		gui.App.quit();
	}
}

function versionChecked(err, newVersionExists, manifest){
  tryingForNewVersion = false; //unlock
  if(err){
  	console.log(err);
  	return Error(err);
  }
  else if(isDownloading){
  	console.log('Already downloading');
  	return;
  }
  else if(!newVersionExists){
  	console.log('No new version exists');
  	return;
  }
  isDownloading = true;
  clearInterval(newVersionCheckIntervalId);
  
  var loaded = 0;
  var newVersion = upd.download(function(error, filename){
  	newVersionDownloaded(error, filename, manifest);
  }, manifest);

  newVersion.on('data', function(chunk){
  	loaded+=chunk.length;
  	document.getElementById('loaded').innerHTML = "New version loading " + Math.floor(loaded / newVersion['content-length'] * 100) + '%';
  })
}
}