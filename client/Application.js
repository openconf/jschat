module.exports = (function () {
    'use strict';

    var BBHistory = Backbone.history, jQuery = Backbone.$;

    ////////////////////

    return _.extend(BBHistory, {
        start: _.wrap(BBHistory.start, function (fn, options) {
            var deferreds = _.map(this.bootstrap, function (reference) {
                    return reference.fetch();
                }),

                doneFilter = _.bind(function () {
                    fn.call(this, options);
                }, this);

            jQuery.when.apply(jQuery, deferreds).then(doneFilter);

            return this;
        }),

        create: function (options) {
            _.extend(this, {
                bootstrap: options.bootstrap,
                routers: options.routers
            });

            this.start(options);

            return this;
        }
    });
}());
