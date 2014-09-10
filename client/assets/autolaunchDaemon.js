
module.exports = function(){
	var path = require('path');	
	var AutoLaunch = require('auto-launch');

  var platform = process.platform;
  platform = /^win/.test(platform)? 'win' : /^darwin/.test(platform)? 'mac' : 'linux' + (process.arch == 'ia32' ? '32' : '64');

  function getAppPath(){
    var appPath = {
      mac: path.join(process.cwd(),'../../..'),
      win: path.dirname(process.execPath)
    };
    appPath.linux32 = appPath.win;
    appPath.linux64 = appPath.win;
    return appPath[platform];
  };


  function getAppExec(){
    var execFolder = getAppPath();
    var exec = {
      mac: '',
      win: path.basename(process.execPath),
      linux32: path.basename(process.execPath),
      linux64: path.basename(process.execPath)
    };
    return path.join(execFolder, exec[platform]);
  };
  console.log(getAppExec());
	

	var nwAppLauncher = new AutoLaunch({
	    name: 'JSChat',
	    isHidden: true,
	    path: getAppExec()
	});

	nwAppLauncher.isEnabled(function(enabled){
	    if(enabled) return;

	    nwAppLauncher.enable(function(err){
	    	console.log(arguments)
	    });

	});
}