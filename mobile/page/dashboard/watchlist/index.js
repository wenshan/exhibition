var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var handlebars = require('alpha-handlebars/handlebars');

var searchItemTpl = require('./src/item.tpl');

require('../../../common/components/zepto-modals/modals');
var infiniteScroll = require('../../../common/components/infinite-scroll/infinite-scroll');

// 渲染图片
handlebars.registerHelper('productPics', function(picList) {
    picList = (picList || []).slice(0, 3);
    var renderStr = '';

    $.each(picList, function(index, item) {
        renderStr += ['<li class="eh-products-item eh-product-item-first">',
            '<div class="eh-products-item-inner">',
            '<span class="eh-middle-helper"></span>',
            '<img src="' + item + '">',
            '</div>',
            '</li>'
        ].join('');
    });

    return new handlebars.SafeString(renderStr);
});

// 渲染主要产品
handlebars.registerHelper('mainProductsShow', function(mainProducts) {
    mainProducts = mainProducts || [];


    return mainProducts.join(' / ');
});


handlebars.registerHelper('showExhibitionNum', function(historyExhNumber) {
    historyExhNumber = historyExhNumber || 0;

    return historyExhNumber + (historyExhNumber == 1 ? ' event' : ' events');
});


var $$ = $;
module.exports = Widget.extend({
    Implements: [infiniteScroll],

    attrs: {
        listReqUrl: '/dashboard/ajax/watch/myList.do',
        connectedUrl: '/dashboard/ajax/connect/connectCompanyList.do',
        watchReqUrl: '/dashboard/ajax/watch/updateWatch.do',
        pageSize: 20
    },

    events: {
        'click [data-role="refine"]': '_popup',
        'click [data-role="ope-btn"]': '_watchOrCancel'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initElements();
        this._getSearchList();

        // 确保这个事件最后初始化
        this._addScrollLoad();
        this.initGoTop();
    },

    _initElements: function() {
        $$ = this.$.bind(this);

        this._listEl = $$('[data-role="list-container"]');

        this._curPage = 1;
        this._searchVal = this._getSearchVal('q');

        this._pageSize = this.get('pageSize');
    },

    _watchOrCancel: function(e) {
        e.preventDefault();

        var targetEl = $$(e.currentTarget);
        var isWatching = targetEl.attr('data-val') === 'watched';

        this.send({
            url: this.get('watchReqUrl'),
            data: {
                companyId: targetEl.attr('data-btn-id'),
                opt: isWatching ? 'unwatch' : 'watch'
            }
        }).done(function(returnData) {
            $.toast(isWatching ? 'Removed from Watch List' : 'Added to Watch List');

            targetEl.attr('data-val', isWatching ? 'unwatch' : 'watched').text(isWatching ? 'Add' : 'Remove');
        });

        return false;
    },

    _getIdObj: function(id, ary, prop) {
        var obj;

        $.each(ary, function(index, item) {
            if (item[prop] == id) {
                obj = item;

                return false;
            }
        });

        return obj;
    },

    _getSearchList: function() {
        return this.send({
            url: this.get('listReqUrl'),
            data: {
                curPage: this._curPage,
                pageSize: this.get('pageSize')
            }
        }).then(function(returnData) {
            returnData = returnData.data;

            console.log(returnData);
            // 将searchList更新为最新的list列表数据
            this.searchList = returnData;

            if (returnData.currentPage >= returnData.totalPage) {
                this.loadedAll = true;
            }

            ++this._curPage;
            this._renderList();
        }.bind(this));
    },

    // list渲染后获取是否已经取得联系
    _getConnectedList: function() {
        var compIds = this._getComponyIds().join(',');
        var connectedClass = 'eh-connect';

        compIds && this.send({
            url: this.get('connectedUrl'),
            data: {
                companyIds: compIds
            },
            type: 'GET'
        }).done(function(returnData) {
            returnData = returnData.data || [];

            $.each(returnData, function(index, item) {
                var coEl = $$('[data-compId="' + item.companyId + '"]');

                if (item.hasConnect) {
                    coEl.html('<span class="eh-connected-marker"></span>Connected');
                } else {
                    coEl.remove();
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

    _renderList: function() {
        this._listEl.find('[data-role="list-loading-helper"]').remove();
        $$('[data-role="res-num"]').text(this.searchList.totalItem);

        if (this.searchList.totalItem) {
            this._listEl.append(handlebars.compile(searchItemTpl)(this.searchList));
            this._getConnectedList();
        } else {
            $$('[data-role="no-content-show"]').show();
            $$('[data-role="view-footer"]').remove();
        }
    },

    _addScrollLoad: function() {
        this.addScroll(this._getSearchList);
    }
});
