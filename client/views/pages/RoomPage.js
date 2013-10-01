module.exports = Backbone.Module('JSChat.views.pages.RoomPage', function () {
    'use strict';

    var AbstractPage = require('./AbstractPage.js');

    ////////////////////

    return AbstractPage.extend({
        template: require('./RoomPage.html')
    });
});
