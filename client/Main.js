module.exports = (function () {
    'use strict';

    require('./Environment.js');
    require('./views/pages/HomePage.js');

    return new JSChat.views.pages.HomePage({
        el: 'body'
    }).render();
}());
