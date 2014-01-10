module.exports = {
  __reinjectModels: false,
  __syncedModels: [],
  __removeListeners: function(){
    // Ensure that we clean up any dangling references when the component is
    // destroyed.
    this.__syncedModels.forEach(function(model) {
      model.off(null, model.__updater, this);
    }, this); 
  },
  componentDidMount: function() {
    // Whenever there may be a change in the Backbone data, trigger a reconcile.
    if(this.injectModels){
      this.injectModels();
    } else {
      this.getBackboneModels().forEach(this.injectModel, this);
    }
  },
  componentDidUpdate: function(){
    if(!this.__reinjectModels) return;
    if(this.injectModels){
      this.injectModels();
    } else {
      this.getBackboneModels().forEach(this.injectModel, this);
    }
    this.__reinjectModels = false;
  },
  componentWillReceiveProps: function(){
    this.__removeListeners();
    this.__reinjectModels = true;
  },
  componentWillUnmount: function(){
    this.__removeListeners();
  },
  injectModel: function(model){
    if(!~this.__syncedModels.indexOf(model)){
      var updater = this.forceUpdate.bind(this, null);
      model.__updater = updater;
      model.on('add change remove', updater, this);
      this.__syncedModels.push(model);
    }
  }
};
