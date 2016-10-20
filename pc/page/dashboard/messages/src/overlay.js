var $ = require('alpha-jquery/jquery');
var Overlay = require('alpha-overlay/overlay');

module.exports = Overlay.extend({
    attrs: {
        trigger: null,
        triggerType: 'click',
        hasMask: false,
        zIndex: 99
    },

    events: {
        'click [data-role="overlay-item"]': '_selectItem'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);
        // 点击页面某个地方就会自动消失
        this._blurHide([this.get('trigger')]);
        this._init();
    },

    _selectItem: function(e) {
        this.hide();

        this.trigger('selected', this.$(e.currentTarget));
    },

    _init: function() {
        var triggerEl = $(this.get('trigger'));

        if (triggerEl.length) {
            triggerEl.on(this.get('triggerType'), function() {
                this.show();
            }.bind(this));

            this.set('align', {
                selfXY: [0, 0],
                baseElement: triggerEl,
                baseXY: [0, '100%']
            });
        }
    },

    show: function() {
        this.constructor.superclass.show.call(this);
    }
});
