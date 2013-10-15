module.exports = (function () {
    'use strict';

    var AbstractCollection = require('./AbstractCollection.js');

    ////////////////////

    var RoomModel = require('../models/RoomModel.js');

    ////////////////////

    return AbstractCollection.extend({
        url: '/api/rooms',
        model: RoomModel
    });
}());
