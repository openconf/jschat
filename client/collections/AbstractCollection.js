module.exports = Backbone.Module('JSChat.collections.AbstractCollection', function () {
    'use strict';

    require('../models/AbstractModel.js');

    ////////////////////

    return Backbone.Collection.extend({
        model: JSChat.models.AbstractModel
    });
});
