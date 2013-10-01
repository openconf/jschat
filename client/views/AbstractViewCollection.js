module.exports = Backbone.Module('JSChat.views.AbstractViewCollection', function () {
    'use strict';

    var AbstractView = require('./AbstractView.js');

    ////////////////////

    require('./AbstractViewModel.js'); // JSChat.views.AbstractViewModel

    ////////////////////

    return AbstractView.extend({
        view: JSChat.views.AbstractViewModel,

        constructor: function (options) {
            this.collectionBinder = new Backbone.CollectionBinder(this, this.collection, {
                view: this.view,
                dummy: this.dummy,
                selector: this.selector
            });

            this.initialize = _.wrap(this.initialize, function (fn, options) {
                return fn.call(this, options);
            });

            AbstractView.call(this, options);
        }
    });
});
