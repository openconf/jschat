module.exports = (function () {
    'use strict';

    var _ = require('underscore');

    ////////////////////

    return _.extend(window, {
        _: _,

        Backbone: _.extend(require('backbone'), {
            $: require('jquery')(window)
        },
            require('backbone.composite'),
            require('backbone.databinding'),
            require('backbone.module'),
            require('backbone.schema')
        ),

        Globalize: require('globalize')
    });
}());
