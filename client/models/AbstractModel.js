module.exports = (function () {
    'use strict';

    var BBModel = Backbone.Model;

    ////////////////////

    return BBModel.extend({
        idAttribute: '_id',

        constructor: function (attributes, options) {
            this.schema = new Backbone.Schema(this);

            this.initialize = _.wrap(this.initialize, function (fn, attributes, options) {
                return fn.call(this, attributes, options);
            });

            BBModel.call(this, attributes, options);
        }
    });
}());
