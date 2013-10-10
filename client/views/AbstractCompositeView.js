module.exports = (function () {
    'use strict';

    var AbstractView = require('./AbstractView.js');

    ////////////////////

    return AbstractView.extend({
        constructor: function (options) {
            this.composite = new Backbone.Composite(this);

            this.initialize = _.wrap(this.initialize, function (fn, options) {
                return fn.call(this, options);
            });

            AbstractView.call(this, options);
        }
    });
}());
