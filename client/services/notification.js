var isVisible = require('./isVisible');

module.exports = {
  show: function(img, title, text){
    if ('DestopNotification' in window){
      var notification = new window.DesktopNotification(title, {icon:img, body:text});
      notification.show();
      return notification;
    }
    if (!Notification){
      console.log("Notifications are not supported");
      return;
    }
    if (Notification.permission === "granted") {
      var notification = new Notification(title, {icon:img,  body:text});
      return notification;
    } else {
      console.log("No premission for notification");
    }
  },
  access: function(){
    if (!Notification){
      console.log("Notifications are not supported");
      return;
    }

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  },
  shouldNotify: isVisible
};