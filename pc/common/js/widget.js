var $ = require('alpha-jquery/jquery');
var Widget = require('alpha-widget/widget');
var ajax = require('./eh-ajax');
var SearchFunc = require('./search-backend');
var account = require('./account-info');
var decEnc = require('./decode-encode');
var title = require('./title');
var loginedCb = require('./logined-cb');

// 针对项目扩展了最基本通用功能的通用Widget，要引入Widget直接引该Widget
module.exports = Widget.extend({
    Implements: [ajax, SearchFunc, decEnc, title, account, loginedCb],

    propsInAttrs: ['extraParams'],

    setup: function() {
        this.element = $(this.get('element'));

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
