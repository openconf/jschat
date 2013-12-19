var Exo = require('exoskeleton');
var _ = require('underscore');
var ContactFactory = require('./ContactFactory.js');
var Room = Exo.Model.extend({
  urlRoot: "/api/rooms",
  initialize: function(){
    this.on('change', function(){
      console.log('changed!!');
    });
    console.log("Initialize Room");
  },
  join: function(opts){
    opts = _({url: this.urlRoot + '/' + this.get('id')}).extend(opts);
    this.sync('join', this, opts);
  },
  leave: function(opts){
    opts = _({url: this.urlRoot + '/' + this.get('id')}).extend(opts);
    this.sync('leave', this, opts);
  },
  switchto: function(opts){
    opts = _({url: this.urlRoot + '/' + this.get('id')}).extend(opts);
    this.sync('switchto', this, opts);
  },
  writingHash:{},
  writing: function(userId){
    //WORK stopped here
    if(!userId) return;
    var user = ContactFactory.getContactModel(userId);
    var users = this.get('writing_users');
    if(!users) users = [];
    var userFound = _(users).find(function(usr){
      return usr.get('id') == user.get('id');
    });
    if(!userFound){
      users = users.concat(user);
      this.set('writing_users', users);
    } else {
      clearTimeout(this.writingHash[userId]);
    }
    
    this.writingHash[userId] = setTimeout(function ejectUser(){
      var ejected = _(this.get('writing_users')).reject(function(usr){
        return usr.get('id') == user.get('id');
      });
      this.set('writing_users', ejected);
    }.bind(this), 3000)
    
  }
})

module.exports = Room;
