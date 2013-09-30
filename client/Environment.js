module.exports = (function () {
    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone'),
        Globalize = require('globalize');

    ////////////////////

    _.extend(Backbone, {
        $: require('jquery')(window)
    },
        require('backbone.composite'),
        require('backbone.databinding'),
        require('backbone.module'),
        require('backbone.schema')
    );

    require('backbone.iosync');
    require('backbone.iobind');

    ////////////////////

    return _.extend(window, {
        _: _,
        Backbone: Backbone,
        Globalize: Globalize
    });
}());
