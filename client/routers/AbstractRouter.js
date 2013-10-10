module.exports = (function () {
    'use strict';

    var BBRouter = Backbone.Router;

    ////////////////////

    return BBRouter.extend({
        constructor: function (options) {
            this.initialize = _.wrap(this.initialize, function (fn, options) {
                return fn.call(this, options);
            });

            BBRouter.call(this, options);
        }
    });
}());
