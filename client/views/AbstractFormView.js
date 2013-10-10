module.exports = (function () {
    'use strict';

    var AbstractModelView = require('./AbstractModelView.js');

    ////////////////////

    return AbstractModelView.extend({
        tagName: 'form',

        constructor: function (options) {
            this.initialize = _.wrap(this.initialize, function (fn, options) {
                return fn.call(this, options);
            });

            AbstractModelView.call(this, options);
        },

        submit: function () {
            var model = this.model;

            if (model.isValid()) {
                model.save();
            }

            return this;
        }
    });
}());
