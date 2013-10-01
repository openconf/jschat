module.exports = Backbone.Module('JSChat.views.pages.HomePage', function () {
    'use strict';

    var AbstractPage = require('./AbstractPage.js');

    ////////////////////

    return AbstractPage.extend({
        template: require('./HomePage.html')
    });
});
