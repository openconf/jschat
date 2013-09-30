module.exports = Backbone.Module('JSChat.views.AbstractView', function () {
    'use strict';

    return Backbone.View.extend({
        render: function () {
            var template = this.template;

            if (template) {
                this.$el.html(template);
            }

            return this;
        }
    });
});
