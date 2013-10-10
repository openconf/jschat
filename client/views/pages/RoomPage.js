module.exports = (function () {
    'use strict';

    var AbstractPage = require('./AbstractPage.js');

    ////////////////////

    return AbstractPage.extend({
        template: require('./RoomPage.html')
    });
}());
