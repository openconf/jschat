module.exports = (function () {
    'use strict';

    var AbstractRouter = require('./AbstractRouter.js');

    ////////////////////

    var HomePage = require('../views/pages/HomePage.js');

    ////////////////////

    return AbstractRouter.extend({
        routes: {
            // FIXME: Redirection should be configured on web-server
            '': function () {
                this.navigate('home', true);
            },

            'home': 'index'
        },

        index: function () {
            var homePage = new HomePage().render();
        }
    });
}());
