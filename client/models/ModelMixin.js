module.exports = {
  __reinjectModels: false,
  __syncedModels: [],
  log: function(text){
    console.log(text)
  },
  __removeListeners: function(){
    this.log("removeListenters");
    // Ensure that we clean up any dangling references when the component is
    // destroyed.
    this.__syncedModels.forEach(function(model) {
      model.off(null, model.__updater, this);
    }, this);
    this.__syncedModels = [];
  },
  componentDidMount: function() {
    this.log("didMount");
    // Whenever there may be a change in the Backbone data, trigger a reconcile.
    if(this.injectModels){
      this.injectModels();
    } else {
      this.getBackboneModels().forEach(this.injectModel, this);
    }
  },
  componentDidUpdate: function(){
    this.log('didUpdate');
    if(!this.__reinjectModels) return;
    if(this.injectModels){
      this.injectModels();
    } else {
      this.getBackboneModels().forEach(this.injectModel, this);
    }
    this.__reinjectModels = false;
  },
  componentWillReceiveProps: function(){
    this.log('willReceive');
    this.__removeListeners();
    this.__reinjectModels = true;
  },
  componentWillUnmount: function(){
    this.log('willUnmount');
    this.__removeListeners();
  },
  injectModel: function(model){
    console.log('inject', model.get('id'));
    if(!~this.__syncedModels.indexOf(model)){
      
      model.on('add change remove', function(){
          console.log("UPDAAA",arguments);
        }, this);
      model.on('add change remove', this.forceUpdate.bind(this, null), this);
      this.__syncedModels.push(model);
    }
  }
};
