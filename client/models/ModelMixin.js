module.exports = {
  __syncedModels: [],
  componentDidMount: function() {
  // Whenever there may be a change in the Backbone data, trigger a reconcile.
    this.getBackboneModels().forEach(this.injectModel, this);
  },
  componentWillUnmount: function() {
  // Ensure that we clean up any dangling references when the component is
    // destroyed.
    console.log("DESTROYER");
    this.__syncedModels.forEach(function(model) {
      model.off(null, model.__updater, this);
    }, this);
  },
  injectModel: function(model){
    if(!~this.__syncedModels.indexOf(model)){
      var updater = this.forceUpdate.bind(this, null);
      model.__updater = updater;
      model.on('add change remove', updater, this);
    }
  }
};
