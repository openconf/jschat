module.exports = (function () {
    'use strict';

    var AbstractRouter = require('./AbstractRouter.js');

    ////////////////////

    var RoomPage = require('../views/pages/RoomPage.js');

    ////////////////////

    return AbstractRouter.extend({
        routes: {
            'room': 'index'
        },

        index: function () {
            var roomPage = new RoomPage().render();
        }
    });
}());
