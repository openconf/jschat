module.exports = (function () {
    'use strict';

    var AbstractRouter = require('./AbstractRouter.js');

    ////////////////////

    var UserPage = require('../views/pages/UserPage.js');

    ////////////////////

    return AbstractRouter.extend({
        routes: {
            'user': 'index'
        },

        index: function () {
            var userPage = new UserPage().render();
        }
    });
}());
