var Widget = require('alpha-widget/widget');
var $ = require('/mobile/common/zepto/zepto');
var SearchFunc = require('/mobile/common/components/search/search');
var FastClick = require('/mobile/common/components/fastclick/FastClick');
var goTop = require('/mobile/common/components/go-top/index');

var ajax = require('/mobile/common/components/ajax/ajax');

module.exports = Widget.extend({
    propsInAttrs: ['extraParams'],

    Implements: [ajax, SearchFunc, goTop],

    jumpToLogin: function() {
        window.location.href = '/login.htm?toUrl=' + window.location.href;
    },

    setup: function() {
        this.element = $(this.get('element'));

        FastClick.attach(document.body);

        this._scrollToTop();

        // 后台搜索通用功能初始化
        this._searchFuncInit();

        this.delegateEvents();
    },

    _scrollToTop: function() {
        if (this._hasScrolled) {
            return;
        }

        this._hasScrolled = true;

        setTimeout(function() {
            document.body.scrollTop = 0;
        }, 40);
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

    htmlDecode: function(str) {
        if (!str || !str.length) {
            return str;
        }

        return str
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ")
            .replace(/&#39;/g, "\'")
            .replace(/&quot;/g, "\"")
            .replace(/<br>/g, "\n")
            .replace(/&amp;/g, '&');
    }
});
