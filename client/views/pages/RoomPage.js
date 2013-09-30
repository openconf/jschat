module.exports = Backbone.Module('JSChat.views.pages.RoomPage', function () {
    'use strict';

    require('./AbstractPage.js');

    ////////////////////

    return JSChat.views.pages.AbstractPage.extend({
        template: require('./RoomPage.html')
    });
});
