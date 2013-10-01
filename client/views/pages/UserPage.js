module.exports = Backbone.Module('JSChat.views.pages.UserPage', function () {
    'use strict';

    var AbstractPage = require('./AbstractPage.js');

    ////////////////////

    return AbstractPage.extend({
        template: require('./UserPage.html')
    });
});
