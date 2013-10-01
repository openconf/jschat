module.exports = Backbone.Module('JSChat.collections.AbstractCollection', function () {
    'use strict';

    var BBCollection = Backbone.Collection;

    ////////////////////

    require('../models/AbstractModel.js'); // JSChat.models.AbstractModel

    ////////////////////

    return BBCollection.extend({
        model: JSChat.models.AbstractModel,

        constructor: function (models, options) {
            this.initialize = _.wrap(this.initialize, function (fn, models, options) {
                return fn.call(this, models, options);
            });

            BBCollection.call(this, models, options);
        }
    });
});
