var isBlurred, isMinimized, isWebBlurred;
// node-webkit part
if(window.isDesktop && global && global.window && global.window.nwDispatcher){
	var gui = global.window.nwDispatcher.requireNwGui();
	var win = gui.Window.get();
	win.on('focus', function(){isBlurred = false});
	win.on('blur', function(){isBlurred = true});
	win.on('minimize', function(){isMinimized = true});
	win.on('restore', function(){isMinimized = false});
}else if(!window.isDesktop && document.addEventListener && navigator.appVersion.indexOf("Mac")!=-1){
	//web mac chrome have problems with HTML5 visibility api
	window.addEventListener('focus', function(){isWebBlurred = false;}, 1);
	window.addEventListener('blur', function(){isWebBlurred = true;}, 1);
}

module.exports = function(){
	var desktopHidden = isBlurred || isMinimized;
	var webIsHidden = document.hidden || document.mozHidden || document.msHidden || document.webkitHidden;
	return webIsHidden || desktopHidden || isWebBlurred;
}