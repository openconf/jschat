module.exports = Backbone.Module('JSChat.routers.AbstractRouter', function () {
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
});
