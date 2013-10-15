module.exports = (function () {
    'use strict';

    var AbstractCollection = require('./AbstractCollection.js');

    ////////////////////

    var UserModel = require('../models/UserModel.js');

    ////////////////////

    return AbstractCollection.extend({
        url: '/api/users',
        model: UserModel
    });
}());
