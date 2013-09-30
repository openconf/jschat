module.exports = Backbone.Module('JSChat.views.pages.UserPage', function () {
    'use strict';

    require('./AbstractPage.js');

    ////////////////////

    return JSChat.views.pages.AbstractPage.extend({
        template: require('./UserPage.html')
    });
});
