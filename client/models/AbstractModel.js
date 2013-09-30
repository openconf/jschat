module.exports = Backbone.Module('JSChat.models.AbstractModel', function () {
    'use strict';

    return Backbone.Model.extend({
        idAttribute: '_id'
    });
});
