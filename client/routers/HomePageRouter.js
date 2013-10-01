module.exports = Backbone.Module('JSChat.routers.HomePageRouter', function () {
    'use strict';

    var AbstractRouter = require('./AbstractRouter.js');

    ////////////////////

    require('../views/pages/HomePage.js'); // JSChat.views.pages.HomePage

    ////////////////////

    return AbstractRouter.extend({
        routes: {
            '(/)': 'index'
        },

        index: function () {
            new JSChat.views.pages.HomePage().render();
        }
    });
});
