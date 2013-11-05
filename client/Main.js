var backbone = require('exoskeleton');
var _ = require('underscore');
var app = function(){
}
_.extend(app,{
  router: require('./router.js'),
  run: function () {
    backbone.history.start({
      pushState: false,
      root: '/'
    });
  }
})
app.run();
module.exports = app;
