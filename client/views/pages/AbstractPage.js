module.exports = Backbone.Module('JSChat.views.pages.AbstractPage', function () {
    'use strict';

    var AbstractView = require('../AbstractView.js');

    ////////////////////

    return AbstractView.extend({
        el: document.body
    });
});
