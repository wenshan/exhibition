var $ = require('alpha-jquery/jquery');
var PaginationComplex = require('alpha-pagination/pagination-complex');
var handlebars = require('alpha-handlebars/handlebars');
var Widget = require('../../../common/js/widget-backend');
var messageTip = require('scc-bp-message-tip/message-tip');

var listTpl = require('./src/search-item.tpl');

var rightPictureThree = require('./src/right-picture-three.tpl');
var rightPictureTwo = require('./src/right-picture-two.tpl');
var rightPictureOne = require('./src/right-picture-one.tpl');

// 当this引用不到Widget实例的时候直接调$$能引用到
var $$ = $;
var HIDDEN_CLASS = 'eh-dsn';

handlebars.registerHelper('mainProductsShow', function(mainProducts) {
    return (mainProducts || []).join(' / ');
});

handlebars.registerHelper('historyExhNumberShow', function(historyExhNumber) {
    return (historyExhNumber || 0) + (historyExhNumber == 1 ? ' event' : ' events');
});

var Index = Widget.extend({

    setup: function() {
        Index.superclass.setup.call(this);

        this._initElements();

        this._reqListData();
    },

    attrs: {
        listReqUrl: '/dashboard/ajax/watch/myList.do',
        connectedUrl: '/dashboard/ajax/connect/connectCompanyList.do',
        watchReqUrl: '/dashboard/ajax/watch/updateWatch.do',
        'watchedOrNotUrl': '/dashboard/ajax/watch/WatchCompanyList.do'
    },

    events: {
        'click [data-role="collection-btn"]': '_watchOrCancel',
        'click [data-role="list-item"]': '_jumpToCompany'
    },

    _jumpToCompany: function(e) {
        var targetEl = $$(e.target);
        var role = targetEl.data('role');

        if (role === 'collection-btn') {
            return;
        }

        location.href = $$(e.currentTarget).data('href');
    },

    _watchOrCancel: function(e) {
        var targetEl = $$(e.currentTarget);

        this.send({
            url: this.get('watchReqUrl'),
            data: {
                companyId: targetEl.data('id'),
                opt: targetEl.hasClass('active') ? 'unwatch' : 'watch'
            }
        }).done(function(returnData) {
            messageTip.success(targetEl.hasClass('active') ? 'Removed from Watch List' : 'Added to Watch List');

            targetEl[targetEl.hasClass('active') ? 'removeClass' : 'addClass']('active');
        });

        return false;
    },

    _reqListData: function() {
        this._getSearchPromise(this._curPage, this._pageSize).then(function(returnData) {
            console.log(returnData);

            this._judgeShow();
        }.bind(this));
    },

    // 进入页面的一个最初的动作 & 搜索结果展示
    _judgeShow: function() {
        if (this.searchList.items && this.searchList.items.length) {
            this._noContentEl.hide();
            this._listContentEl.show();

            this._renderList();
            this._initPagination();
        } else {
            this._listContentEl.hide();

            this._noContentEl.show();
        }
    },

    // 统一入口方法
    _getSearchPromise: function(curPage, pageSize) {
        curPage = curPage || 1;
        pageSize = pageSize || this._pageSize;

        return this.send({
            url: this.get('listReqUrl'),
            data: {
                curPage: curPage,
                pageSize: pageSize
            }
        }).then(function(returnData) {
            $$('[data-role="loading-helper"]').hide();

            return (this.searchList = returnData.data);
        }.bind(this));
    },

    // 翻页
    _turnPage: function(to, _self) {
        this._getSearchPromise(to).done(function(returnData) {
            document.body.scrollTop = 0;

            _self.set('current', to);
            this._renderList();
        }.bind(this));
    },

    // 渲染list列表通用函数
    _renderList: function() {
        var len = this.searchList.items.length;

        this._searchNumEl.css({
            'vertical-align': 'baseline'
        }).html(this.searchList.totalItem);
        this._searchedResTextEl.html(len > 1 ? ' companies' : ' company');

        if (len) {
            var renderHtml = handlebars.compile(listTpl)(this.searchList);

            this._listContainerEl.html(renderHtml);

            this._renderImgs();
            this._renderExhiHisPics();

            this._getConnectedList();
        } else {
            this._listContainerEl.remove();

            this._paginationEl.remove();
        }

    },

    _renderImgs: function() {
        var items = this.searchList.items;

        $$('[data-role="right-pictures"]').each(function(index, picParEl) {
            picParEl = $$(picParEl);

            var leftEl = picParEl.closest('[data-role="list-item"]').find('[data-role="list-item-left"]');

            var dataAry = items[index].picList || [];
            var dataAryLen = dataAry.length;

            if (!dataAryLen) {
                picParEl.css({
                    'vertical-align': 'middle',
                    'font-size': '14px'
                }).html('<div style="display: inline-block;width: 240px;text-align: center;"></div>');

                // picParEl.hide();
            } else if (dataAryLen === 1) {
                picParEl.css({
                    'vertical-align': 'middle'
                }).html(handlebars.compile(rightPictureOne)({
                    imgUrl: dataAry[0]
                }));
            } else if (dataAryLen === 2) {
                picParEl.html(handlebars.compile(rightPictureTwo)({
                    imgUrl_0: dataAry[0],
                    imgUrl_1: dataAry[1]
                }));
            } else {
                // 三个
                dataAry = dataAry.slice(0, 3);

                picParEl.html(handlebars.compile(rightPictureThree)({
                    imgUrl_0: dataAry[0],
                    imgUrl_1: dataAry[1],
                    imgUrl_2: dataAry[2]
                }));
            }
        });
    },

    _renderExhiHisPics: function() {
        var items = this.searchList.items;
        var me = this;

        $$('[data-role="exhibition-his-pics"]').each(function(index, parEl) {
            parEl = $$(parEl);

            var ary = [];
            var hisAry = (items[index].historyExhibition || []).slice(0, 5);

            $.each(hisAry, function(index, his) {
                ary.push('<a class="eh-history-ehibition" title="' + me.htmlEncode(his.name) + '" style="background-image: url(' + his.logo + ');"></a>');
            });

            if (ary.length) {
                parEl.html(ary.join(''));
            }
        });
    },



    // 是否已取得联系
    _getConnectedList: function() {
        var compIds = this._getComponyIds().join(',');
        var connectedClass = 'eh-connect';

        this.send({
            url: this.get('connectedUrl'),
            data: {
                companyIds: compIds
            },
            type: 'GET'
        }).done(function(returnData) {
            returnData = returnData.data || [];

            console.log('connected:', returnData);

            $.each(returnData, function(index, item) {
                var coEl = $$('[data-compId="' + item.companyId + '"]');
                var parEl = coEl.closest('[data-role="connected"]');

                if (item.hasConnect) {
                    coEl.addClass('eh-connect').html('connected');
                    parEl.show();
                } else {
                    coEl.removeClass('eh-connect').html('not connected yet');
                    parEl.remove();
                }
            });
        });
    },

    _getComponyIds: function() {
        var compIds = [];

        $.each(this.searchList.items, function(index, item) {
            compIds[compIds.length] = item.companyId;
        });

        return compIds;
    },

    // 分页处理
    _initPagination: function() {
        this._paginationEl.html('');

        this._pagination = new PaginationComplex({
            parentNode: this._paginationEl,
            total: this.searchList.totalPage,
            current: this._curPage,
            pageEscape: '%page%'
        }).render();

        // 翻页
        this._pagination.on('turn', this._turnPage.bind(this));
    },

    // ###### 公共helper ######
    _initElements: function() {
        $$ = this.$.bind(this);
        this._paginationEl = $$('[data-role="eh-pagination"]');
        this._listContainerEl = $$('[data-role="list-container"]');
        this._rightContentEl = $$('[data-role="right-content"]');
        this._listContentEl = $$('[data-role="content-show"]');
        this._noContentEl = $$('[data-role="no-content-show"]');
        this._searchNumEl = $$('[data-role="search-num"]');
        this._searchedResTextEl = $$('[data-role="found-text"]');

        this._curPage = this._curPage || 1;
        this._pageSize = 36;
    },

    _show: function(el) {
        el = $$(el);

        return el.hasClass(HIDDEN_CLASS) ? el.removeClass(HIDDEN_CLASS) : el.show();
    },

    _hide: function(el) {
        return $$(el).addClass(HIDDEN_CLASS);
    }
});

module.exports = Index;
