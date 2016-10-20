var Balloon = require('alpha-balloon/balloon');

module.exports = Balloon.extend({
    setup: function() {
        this.constructor.superclass.setup.call(this);
    },

    show: function() {
        this.element.addClass('animated');
        this.constructor.superclass.show.call(this);

        this.element.addClass('zoomIn');
    }
});
