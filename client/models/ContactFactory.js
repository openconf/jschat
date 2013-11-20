var contactModelsCache = {};
var ContactModel = require('./Contact');
var ContactsCollection = require('./Contacts');
var _ = require('underscore');
/**
 * this Factory should minimize calls to server for contacts information:
 * - any new cache model with ID defined will be fetched
 * - any model that doesn't have ID will be watched untill it get's the ID
 * - any collection will be watched untill it get's models with ID's and those will be saved 
 *   in cache
 */
module.exports = {
  getContactModel: function(id){
    if(id && contactModelsCache[id]){
      return contactModelsCache[id];
    }
    var contact = new ContactModel({id: id});
    if(contact.get('id')){
      contact.fetch();
      return putInCache.call(contact);
    }
    contact.on('change', putInCache, contact);
    return contact;
  },
  getContactsCollection: function(){
    var collection = new ContactsCollection();
    collection.on('change', processCollection, collection);
    return collection;
  }
}


function processCollection(){
  _(this.models).each(function(contact){
    var modelId = contact.get('id');
    if(!modelId) return;
    if(contactModelsCache[modelId]){
      return contactModelsCache[modelId].set(contact.toJSON());
    }
    putInCache.call(contact);
  });
}

function putInCache(){
  if(this.get('id')){
    contactModelsCache[this.get('id')] = this;
    this.off('change', putInCache);
  }
  return this;
}
