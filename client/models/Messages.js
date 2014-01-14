var Exo = require('exoskeleton');
var MessageModel = require('./Message');
var ContactFactory = require('./ContactFactory.js');
var _ = require('underscore');
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
  refresh: function(){
    if(this._isFetching) return;
    this._isFetching = true;
    var last = this.models[this.models.length-1].get('id');
    this.sync('read', this, {attrs:{
      to: last
    }, success: gotResult.bind(this)});
    function gotResult(array){
      this.add(array);
      this._isFetching = false;
    }
  },
  userWritingHash: [],
  userWriting: function(userId){
    //WORK stopped here
    if(!userId) return;
    var user = ContactFactory.getContactModel(userId);
    var users = this.writing_users || [];
    var userFound = _(users).find(function(usr){
      return usr.get('id') == user.get('id');
    });
    if(!userFound){
      users = users.concat(user);
      this.writing_users = users;
      this.trigger('change');
    } else {
      clearTimeout(this.userWritingHash[userId]);
    }
    
    this.userWritingHash[userId] = setTimeout(function ejectUser(){
      var ejected = _(this.writing_users).reject(function(usr){
        return usr.get('id') == user.get('id');
      });
      this.writing_users = ejected;
      this.trigger('change');
    }.bind(this), 3000)
  },
  model: MessageModel
})

module.exports = MessageCollection;
