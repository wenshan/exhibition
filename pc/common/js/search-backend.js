/**
 * 存放一些公共功能。公共功能列表如下：
 * 1. 后台公共搜索跳转功能；
 * 2. 个人信息卡片；
 * 3. 公司信息卡片；
 * 4. 展会信息卡片
 */

var $ = require('alpha-jquery/jquery');
var MessageTip = require('scc-bp-message-tip/message-tip');
require('./jquery-placeholder');

var $$ = $;

module.exports = {
    // 执行一些初始化
    _searchFuncInit: function() {

        var events = {
            // 顶部搜索通用验证事件
            'input [data-role="search-inp"]': '_searchInp',
            // 执行搜索事件
            'click [data-role="search-btn"]': '_search',
            'keydown [data-role="search-inp"]': '_search'
        };

        this.events = $.extend(this.events, events);

        this._Ie9Placeholder();
    },

    // 输入框输入验证
    _searchInp: function(e) {
        // 搜索框输入控制程序
        var targetEl = $$(e.currentTarget);
        var val = $.trim(targetEl.val() || '');

        if (!val.length) {
            return;
        }

        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }

        this._timeoutId = setTimeout(function() {
            var checkRes = this._searchInpCheck(val);
        }.bind(this), 200);
    },

    // 执行搜索
    _search: function(e) {
        if (!e.keyCode || e.keyCode === 13) {

            var targetEl = $$('[data-role="search-inp"]');
            var val = $.trim(targetEl.val());
            var checkRes = this._searchInpCheck(val);

            if (checkRes) {
                // 初始化一些数据
                this._curPage = 1;

                this._searchVal = val;
                this.__jump(val, '', '', true);
            }

        }

    },

    // 真正的输入验证方法
    _searchInpCheck: function(inpVal) {
        var errorMessage = '';
        var valLength = inpVal.length;

        if (valLength === 0) {
            errorMessage = 'Please input a search term.';
        } else if (!/^[\w\d\!\@\#\$\%\^\&\*\(\)\_\-\+\=\:\;\'\"\<\,\>\.\?\/\~\`\s\·\{\}\[\]\|\\]+$/.test(inpVal)) {
            errorMessage = errorMessage || 'Please input using English only.';
        } else if (valLength > 50) {
            errorMessage = errorMessage || 'Input must be less than 50 characters.';
        }

        if (errorMessage) {
            MessageTip.error(errorMessage);
        }

        return !errorMessage;
    },

    // 页面跳转到后台首页公共方法
    __jump: function(q, country, industry, noFilter) {
        q = q || this._searchVal || this._getSearchVal('q');

        if (noFilter) {
            country = '';
            industry = '';
        } else {
            country = country || this._countryRefine;
            industry = industry || this._categoryRefine;
        }


        var urlAdress = [location.protocol + '//', location.host, '/company/search'].join('');
        var ary = [];

        if (q) {
            ary.push('q=' + q);
        }

        if (country) {
            ary.push('country=' + country);
        }

        if (industry) {
            ary.push('industry=' + industry);
        }

        if (ary.length) {
            urlAdress += ('?' + ary.join('&'));
        }

        location.href = urlAdress;
    },

    // 从url获取某个指定值的通用方法
    _getSearchVal: function(search) {
        var searches = location.search.substring(1).split('&');
        var val = '';

        if (search === 'q') {
            if (~location.search.indexOf('?q=') || ~location.search.indexOf('&q=')) {
                try {
                    return decodeURIComponent(location.search.substring(1).split('=')[1]);
                } catch (e) {
                    return location.search.substring(1).split('=')[1];
                }

            } else {
                return '';
            }

        }

        $.each(searches, function(index, item) {
            item = item.split('=');

            if (item[0] === search) {
                val = item[1];

                return false;
            }
        });

        return decodeURIComponent(val);
    },

    _Ie9Placeholder: function() {
        $('[data-role="search-inp"]').placeholder();
    }
};
