var Exo = require('exoskeleton');
var MessageModel = require('./Message');

var MessageCollection = Exo.Collection.extend({
  url: function(){
    return "/api/rooms/" + this.roomId + "/messages";
  },
  initialize: function(models, options){
    this.roomId = options.roomId;
  },
  writing: function(){
    this.sync('writing', this);
  },
  addToTop: function(){
    if(this._isFetching) return;
    this._isFetching = true;
    console.log(this._isFetching);
    var oldest = this.models[0].get('id');
    this.sync('read', this, {attrs:{
      from: oldest-1,
      count: -50
    }, success: gotResult.bind(this)});
    function gotResult(array){
      this.unshift(array);
      this._isFetching = false;
    }
  },
  model: MessageModel
})

module.exports = MessageCollection;
