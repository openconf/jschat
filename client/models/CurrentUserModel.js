module.exports = (function () {
    'use strict';

    var AbstractModel = require('./AbstractModel.js');

    ////////////////////

    return AbstractModel.extend({
        url: '/api/me'
    });
}());
