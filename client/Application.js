module.exports = (function () {
    'use strict';

    var BBHistory = Backbone.history, jQuery = Backbone.$;

    ////////////////////

    return _.extend(BBHistory, {
        start: _.wrap(BBHistory.start, function (fn, options) {
            var promises = _.map(this.bootstrap, function (reference) {
                    return reference.fetch();
                }),

                doneFilter = _.bind(function () {
                    fn.call(this, options);
                }, this);

            jQuery.when.apply(jQuery, promises).then(doneFilter);

            return this;
        }),

        create: function (configuration) {
            return _.extend(this, configuration).start();
        }
    });
}());
