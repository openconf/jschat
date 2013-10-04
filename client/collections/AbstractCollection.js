module.exports = Backbone.Module('JSChat.collections.AbstractCollection', function () {
    'use strict';

    var BBCollection = Backbone.Collection;

    ////////////////////

    return BBCollection.extend({
        model: require('../models/AbstractModel.js'),

        constructor: function (models, options) {
            this.initialize = _.wrap(this.initialize, function (fn, models, options) {
                return fn.call(this, models, options);
            });

            BBCollection.call(this, models, options);
        }
    });
});
