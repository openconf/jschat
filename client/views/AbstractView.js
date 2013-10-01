module.exports = Backbone.Module('JSChat.views.AbstractView', function () {
    'use strict';

    var BBView = Backbone.View;

    ////////////////////

    return BBView.extend({
        constructor: function (options) {
            this.composite = new Backbone.Composite(this);

            this.initialize = _.wrap(this.initialize, function (fn, options) {
                return fn.call(this, options);
            });

            BBView.call(this, options);
        },

        render: function () {
            var template = this.template;

            if (template) {
                this.$el.html(template);
            }

            return this;
        }
    });
});
