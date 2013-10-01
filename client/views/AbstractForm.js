module.exports = Backbone.Module('JSChat.views.AbstractForm', function () {
    'use strict';

    var AbstractViewModel = require('./AbstractViewModel.js');

    ////////////////////

    return AbstractViewModel.extend({
        tagName: 'form',

        submit: function () {
            var model = this.model;

            if (model.isValid()) {
                model.save();
            }

            return this;
        }
    });
});
