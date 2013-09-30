module.exports = Backbone.Module('JSChat.views.pages.HomePage', function () {
    'use strict';

    require('./AbstractPage.js');

    ////////////////////

    return JSChat.views.pages.AbstractPage.extend({
        template: require('./HomePage.html')
    });
});
