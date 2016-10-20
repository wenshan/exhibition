/**
 * 扩展了后台页面通用方法的公共Widget
 */

var $ = require('alpha-jquery/jquery');
var Widget = require('alpha-widget/widget');
var ajax = require('./eh-ajax');
var account = require('./account-info');
var SearchFunc = require('./search-backend');
var nav = require('./left-nav');
var decEnc = require('./decode-encode');
var title = require('./title');
var loginedCb = require('./logined-cb');

module.exports = Widget.extend({
    Implements: [ajax, SearchFunc, account, nav, decEnc, title, loginedCb],

    propsInAttrs: ['extraParams'],

    setup: function() {
        this.element = $(this.get('element'));
        // 左侧导航栏渲染
        this._leftNavInit();

        // 后台搜索通用功能初始化
        this._searchFuncInit();

        // 个人信息渲染
        this._renderAccountInfo();

        this.delegateEvents();

        this.showTitle();

        this.on('hooks', function() {
            this._checkHasCb();
        }.bind(this));
    },

    jumpToLogin: function() {
        window.location.href = '/login.htm?toUrl=' + window.location.href;
    }
});
