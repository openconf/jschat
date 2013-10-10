module.exports = (function () {
    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone'),
        Globalize = require('globalize'),
        Socket = require('engine.io');

    ////////////////////

    _.extend(Backbone, {
        $: require('jquery')(window)
    },
        require('backbone.composite'),
        require('backbone.databinding'),
        require('backbone.schema')
    );

    require('bootstrap');

    ////////////////////

    return _.extend(window, {
        _: _,
        Backbone: Backbone,
        Globalize: Globalize,
        Socket: Socket
    });
}());
