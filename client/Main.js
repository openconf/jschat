module.exports = (function () {
    'use strict';

    require('./Environment.js');

    ////////////////////

    var Application = require('./Application.js');

    ////////////////////

    require('./routers/HomePageRouter.js'); // JSChat.routers.HomePageRouter

    ////////////////////

    return Application.create({
        routers: {
            homePageRouter: new JSChat.routers.HomePageRouter()
        }
    }).start();
}());
