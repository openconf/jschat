module.exports = Backbone.Module('JSChat.views.AbstractCollectionView', function () {
    'use strict';

    var AbstractView = require('./AbstractView.js');

    ////////////////////

    return AbstractView.extend({
        constructor: function (options) {
            this.collectionBinder = new Backbone.CollectionBinder(this, this.collection, options);

            this.initialize = _.wrap(this.initialize, function (fn, options) {
                return fn.call(this, options);
            });

            AbstractView.call(this, options);
        }
    });
});
