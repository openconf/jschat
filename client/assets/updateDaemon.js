/*
TODO: we need to check for new app version, download if it's available. 
Notify user about new version and ask if he want to update the app.
Right after he is telling that he want to do this we need to copy the app.
So far everything is automatic.
*/
var newVersionCheckIntervalId = null;
var tryingForNewVersion = false;
var isDownloading = false;
/**
* args are require('nw.gui').App.argv
* cb should be require('nw.gui').App.quit()
*/
module.exports = function(args, cb){
  var updater = require('node-webkit-updater');
  var pkg = require('./package.json');
  window.pkg = pkg;
  var copyPath, execPath;
  var upd = new updater(pkg);

/*
1) check version update on start
2) if version is changed start updating 

1) check version update periodically
2) if version is updated, show update screen
we need to save cookies before updating stuff
*/


  if(args.length){
  	copyPath = args[0];
  	execPath = args[1];
  }

  if(!copyPath){
  	newVersionCheckIntervalId = setInterval(function(){
  		if(!isDownloading && !tryingForNewVersion) {
            tryingForNewVersion = true; //lock
            upd.checkNewVersion(versionChecked);
          }
        }, 10000);
  }else{
  	upd.install(copyPath, newAppInstalled);

  	function newAppInstalled(err){
  		if(err){
  			console.log(err);
  			return;
  		}
  		upd.run(execPath, null);
  	  cb();
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
    var perc = 0;
    
    newVersion.on('data', function(chunk){
    	loaded+=chunk.length;
      if(perc != Math.floor(loaded / newVersion['content-length'] * 100)){
        console.log("New version loading " + Math.floor(loaded / newVersion['content-length'] * 100) + '%');
        perc = Math.floor(loaded / newVersion['content-length'] * 100);
      }
      
    })
  }
  function newVersionDownloaded(err, filename, manifest){
    if(err){
      console.log(err)
      return Error(err);
    }
    setTimeout(function(){upd.unpack(filename, newVersionUnpacked, manifest);}, 1000)
  }

  function newVersionUnpacked(err, newAppPath){
   
    if(err){
      console.log(err)
      return Error(err);
    }
   
    var runner = upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()]);
    cb();
  }
}