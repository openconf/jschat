module.exports = {
  show: function(img, title, text){
    if (!window.webkitNotifications){
      console.log("Notifications are not supported");
      return;
    }

    if (window.webkitNotifications.checkPermission() === 0) {
      var notification = window.webkitNotifications.createNotification(img, title, text);
      notification.show();
      return notification;
    } else {
      console.log("No premission for notification");
    }
  },
  access: function(){
    if (!window.webkitNotifications){
      console.log("Notifications are not supported");
      return;
    }

    if (window.webkitNotifications.checkPermission() !== 0) {
      window.webkitNotifications.requestPermission();
    }
  },
  shouldNotify: function(){
    return document.hidden || document.mozHidden || document.msHidden || document.webkitHidden;
  }
};