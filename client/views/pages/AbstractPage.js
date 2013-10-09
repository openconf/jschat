module.exports = Backbone.Module('JSChat.views.pages.AbstractPage', function () {
    'use strict';

    var AbstractCompositeView = require('../AbstractCompositeView.js');

    ////////////////////

    return AbstractCompositeView.extend({
        el: 'body > .container',

        constructor: function (options) {
            this.initialize = _.wrap(this.initialize, function (fn, options) {
                return fn.call(this, options);
            });

            AbstractCompositeView.call(this, options);
        }
    });
});
