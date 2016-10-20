var $ = require('alpha-jquery/jquery');
var Handlebars = require('alpha-handlebars/handlebars');
var Overlay = require('alpha-overlay/overlay');

/*

    参数只有一个 trigger， 是选择器，不是jquery对象，
    统一取trigger元素的  data-title 属性显示

*/
var Title = Overlay.extend({

    attrs: {
        template: '<div class="title-box"></div>',
        align: {
            selfXY: [0, 0],
            baseXY: [0, 0]
        },
        zIndex: 99999,
        style: {
            'line-height': '18px',
            'padding': '3px 8px',
            'border': '1px solid rgb(218, 226, 237)',
            'border-radius': '2px',
            'box-shadow': 'rgba(0, 0, 0, 0.247059) 2px 2px 4px 0px',
            'word-wrap': 'break-word',
            'position': 'absolute',
            'background-color': 'rgb(255, 255, 255)',
            'display': 'none'
        },
    },
    setup: function() {
        var _self = this;
        this._initElements();
        this._initEvent();
        Title.superclass.setup.apply(this, arguments);
    },
    _initElements: function() {

        this.activeTrigger = $(this.get('trigger'));
        this.tpl = '{{tips}}';
    },
    _initEvent: function() {

        var _self = this;

        this.activeTrigger.on('mouseover', '[title]', function() {

            var _html = $(this).attr('title') ? $(this).attr('title') : $(this).attr('data-title');
            $(this).attr('data-title', _html);
            $(this).attr('title', '');
            if (!_html) {
                return false;
            }
            _self.activeTrigger.on('mousemove', '[title]', function(e) {
                var mouseX = e.clientX;
                var mouseY = e.clientY;

                _self.set('align', {
                    baseXY: _self._getPosition(mouseX, mouseY)[0]
                });
                _self.element.css({
                    'max-width': _self._getPosition(mouseX, mouseY)[1]
                });
            });

            _self.element.html(Handlebars.compile(_self.tpl)({tips: _html}));
            _self.show();
        });
        this.activeTrigger.on('mouseout', '[title]', function() {
            _self.hide();
            _self.activeTrigger.find('[title]').unbind('mousemove');
            _self.element.css({
                'max-width': ''
            });
        });
    },
    _getPosition: function(x, y) {

        var clientWidth = $(window).width();
        var elWidth = $(this.element).width();
        var nx = x;
        var mW;

        if (clientWidth - x < elWidth) {
            nx = x - elWidth - 2;
            if(x < elWidth)
            {
                mW = x - 30;
            }
        }


        return [[nx + 10, y + 14],mW];
    }


});

module.exports = {
    showTitle: function() {
        var _self = this;
        new Title({
            trigger: 'body'
        });
    }
};
