var Wrapper = require('./wrapper')
var composer = require('composer')();

module.exports = function(app){
  app.rootNode = app.rootNode || document.body;
  
  app.render = function render(options){
    options = options || {};
    var layoutComp = composer.compose('layout');
    if(!layoutComp) throw new Error('can"t render without "layout" defined in composer');
    if(!app.rootComp || options.force){
      if(options.force) React.unmountComponentAtNode(app.rootNode);
      app.rootComp = React.renderComponent(Wrapper(layoutComp)(options.props), app.rootNode);
      return;
    }
    layoutComp.forceUpdate();
  }
  return app;
}