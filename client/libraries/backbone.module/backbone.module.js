/**
 * Backbone.Module v0.1.8
 * https://github.com/DreamTheater/Backbone.Module
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
(function (factory) {
    'use strict';

    var isNode = typeof module === 'object' && typeof exports === 'object';

    ////////////////////

    var root = isNode ? {
        _: require('underscore'),
        Backbone: require('backbone')
    } : window;

    ////////////////////

    (isNode ? exports : Backbone).Module = factory(root, isNode);

}(function (root) {
    'use strict';

    var _ = root._, Backbone = root.Backbone;

    ////////////////////

    var Module = Backbone.Module = function (namespace, callback) {
        var scope = window, packageNames = namespace.split('.'), className = packageNames.pop();

        _.each(packageNames, function (packageName) {
            var layer = scope[packageName];

            if (!layer) {
                layer = scope[packageName] = {};
            }

            scope = layer;
        });

        scope = scope[className] = _.isFunction(callback) ? callback.call({
            namespace: namespace,
            className: className
        }) : callback;

        return scope;
    };

    return Module;
}));
