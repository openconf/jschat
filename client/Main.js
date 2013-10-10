module.exports = (function () {
    'use strict';

    require('./Environment.js');

    ////////////////////

    var Application = require('./Application.js');

    ////////////////////

    var HomePageRouter = require('./routers/HomePageRouter.js'),
        RoomPageRouter = require('./routers/RoomPageRouter.js'),
        UserPageRouter = require('./routers/UserPageRouter.js');

    ////////////////////

    var application = Application.create({
        bootstrap: {
            // Models and collection which must be loaded before application started
        },

        routers: {
            homePageRouter: new HomePageRouter(),
            roomPageRouter: new RoomPageRouter(),
            userPageRouter: new UserPageRouter()
        }
    });

    return application;
}());
