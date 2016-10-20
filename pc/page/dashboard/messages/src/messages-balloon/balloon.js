var Balloon = require('alpha-balloon/balloon');
var handlebars = require('alpha-handlebars/handlebars');
var contentTpl = require('./content.tpl');
var noMessages = require('./no-messages.tpl');
var $ = require('alpha-jquery/jquery');

module.exports = Balloon.extend({
    attrs: {
        curPage: {
            val: 1,

            getter: function(val) {
                return this._curPage || val;
            },

            setter: function(val) {
                this._curPage = val;

                this._modify();
            }
        },
        totalPage: 0,
        messages: []
    },

    events: {
        'click [data-role="turn-left"]': '_turnLeft',
        'click [data-role="turn-right"]': '_turnRight'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);
        // 点击空白地方消失
        this._blurHide([this.get('trigger')]);

        this._init();
    },

    show: function(){
        this.element.addClass('animated');
        this.constructor.superclass.show.call(this);

        this.element.addClass('zoomIn');
    },

    htmlEncode: function(str) {
        if (!str || !str.length) {
            return str;
        }

        return str
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/ /g, "&nbsp;")
            .replace(/\'/g, "&#39;")
            .replace(/\"/g, "&quot;")
            .replace(/\n/g, "<br>");
    },

    _init: function() {
        var messages = this.get('messages');
        this._curPage = this._curPage || 1;

        if (messages.length) {
            var message = messages[this._curPage - 1];

            this.set('totalPage', messages.length);

            this.set('content', handlebars.compile(contentTpl)({
                date: message.date,
                message: new handlebars.SafeString(message.message.replace(/\r|\n|\r\n/g, '<br>')),
                curPage: this._curPage,
                totalPage: this.get('totalPage')
            }));
        } else {
            this.set('totalPage', 0);
            this.set('curPage', 0);
            this.set('content', noMessages);
        }
    },

    _modify: function() {
        var messages = this.get('messages');
        var message = messages[this._curPage - 1];

        this.$('[data-role="date"]').text(message.date);
        this.$('[data-role="message"]').html(this.htmlEncode(message.message).replace(/\r|\n|\r\n/g, '<br>'));
        this.$('[data-role="cur-page"]').text(this._curPage);
    },

    _turnLeft: function(e) {
        if (this._curPage > 1) {
            this.set('curPage', --this._curPage);
        }
    },

    _turnRight: function(e) {
        if (this._curPage < this.get('totalPage')) {
            this.set('curPage', ++this._curPage);
        }
    }
});
