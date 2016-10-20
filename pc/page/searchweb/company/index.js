var $ = require('alpha-jquery/jquery');
var PaginationComplex = require('alpha-pagination/pagination-complex');
var handlebars = require('alpha-handlebars/handlebars');
var Widget = require('../../../common/js/widget');
var messageTip = require('scc-bp-message-tip/message-tip');


var listTpl = require('./src/search-item.tpl');
var refineCountryTpl = require('./src/refine-country.tpl');
var refineCategoryTpl = require('./src/refine-category.tpl');

var rightPictureThree = require('./src/right-picture-three.tpl');
var rightPictureTwo = require('./src/right-picture-two.tpl');
var rightPictureOne = require('./src/right-picture-one.tpl');

// 当this引用不到Widget实例的时候直接调$$能引用到
var $$ = $;
var HIDDEN_CLASS = 'eh-dsn';

handlebars.registerHelper('exhNum', function(historicalExhibitionIds) {
    var len = historicalExhibitionIds.length;

    return (len + ((len === 0 || len > 1) ? ' events' : ' event'));
});

handlebars.registerHelper('nameShow', function(name1, name2) {
    var name = name1;

    if (name1 && name2) {
        name = [name1, name2].join(', ');
    }

    return new handlebars.SafeString(name);
});

handlebars.registerHelper('showEm', function(products) {
    return new handlebars.SafeString(products === 'null' ? '' : products);
});


var Index = Widget.extend({
    propsInAttrs: ['searchList', 'refineCountryList', 'refineIndustryList', 'isLogined'],

    setup: function() {
        Index.superclass.setup.call(this);

        this._initElements();

        this._pendSearchValToInp();
        this._refineRender();
        this._judgeShow();
        this._resizeInit();

        console.log(this.searchList);
    },

    attrs: {
        extraParams: {},
        listReqUrl: '/company/api/search',
        connectedUrl: '/dashboard/ajax/connect/connectCompanyList.do',
        watchReqUrl: '/dashboard/ajax/watch/updateWatch.do',
        'watchedOrNotUrl': '/dashboard/ajax/watch/WatchCompanyList.do' // companyIds
    },

    events: {
        'click [data-role="filter-item"]': '_filter',
        'click [data-role="filtered-close"]': '_closeFilter',
        'click [data-role="collection-btn"]': '_watchOrCancel',
        'click [data-role="refine-item-shrink"]': '_expandRefine',
        'click [data-href]': '_jumpToCompany',
        'click [data-role="refine-return"]': '_refineReturn'
    },

    _resizeInit: function() {
        var windowEl = $(window);

        var resize = function() {
            if (document.body.scrollWidth > 999) {
                $$('[data-role="content"]').removeClass('eh-content-shrink');
            } else {
                $$('[data-role="content"]').addClass('eh-content-shrink');
            }
        };

        resize();

        windowEl.resize(function() {
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }

            this._timeoutId = setTimeout(resize, 16);
        }.bind(this));
    },

    _refineReturn: function() {
        $('[data-role="refine-expand"]').hide();
        $('[data-role="refine-shrink"]').show();

        $('[data-role="left-container"]').css({
            width: '65px'
        });
    },

    _expandRefine: function() {
        $('[data-role="refine-expand"]').show();
        $('[data-role="refine-shrink"]').hide();

        $('[data-role="left-container"]').css({
            width: '240px'
        });
    },

    _jumpToCompany: function(e) {
        var targetEl = $$(e.target);

        if (targetEl.data('role') === 'collection-btn') {
            return;
        }

        location.href = $$(e.currentTarget).data('href');
    },

    _watchOrCancel: function(e) {
        if (this.isLogined !== 'true') {
            this.jumpToLogin();
        }

        e.preventDefault();

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

    _filter: function(e) {
        var targetEl = $$(e.currentTarget);
        this._filterElShow(targetEl);

        this._getSearchPromise(1).done(function(returnData) {
            this.searchList = returnData;

            this._renderList();
        }.bind(this));
    },

    // 是否已关注的请求
    _getWatchList: function() {
        var compIds = this._getComponyIds().join(',');

        compIds && this.send({
            url: this.get('watchedOrNotUrl'),
            data: {
                companyIds: compIds
            },
            type: 'GET'
        }).done(function(returnData) {
            returnData = returnData.data || [];

            returnData.length && $.each(returnData, function(index, item) {
                $$('[data-role="collection-btn"][data-id="' + item.companyId + '"]')[item.hasWatched ? 'addClass' : 'removeClass']('active');
            });
        });
    },

    // 是否已取得联系
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
                var parEl = coEl.closest('[data-role="connected"]');
                // TODO:
                if (item.hasConnect) {
                    coEl.addClass('eh-connect').html('Connected');
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

        $$('[data-role="collection-btn"]').each(function(index, item) {
            item = $$(item);

            compIds[compIds.length] = item.data('id');
        });

        return compIds;
    },

    _filterElShow: function(targetEl) {
        var selectedText = targetEl.text();
        var val = targetEl.data('val');

        var parEl = targetEl.closest('[data-role="filter-container"]');
        var filteredStatusEl = parEl.find('[data-role="filtered-status"]');

        // 点击后的交互
        this._hide(parEl.find('[data-role="filter-items-par"]'));
        this._show(filteredStatusEl).find('[data-role="filter-selected-content"]').text(selectedText);


        // 数据处理
        if (targetEl.data('refine') === 'country') {
            this._countryRefine = val;
        } else {
            this._categoryRefine = val;
        }
    },

    // 关闭掉过滤
    _closeFilter: function(e) {
        var targetEl = $$(e.currentTarget);
        var refine = targetEl.data('refine');

        // DOM操作
        var parEl = targetEl.closest('[data-role="filter-container"]');
        var filteredEl = parEl.find('[data-role="filtered-status"]');
        var filterListEl = parEl.find('[data-role="filter-items-par"]');

        this._hide(filteredEl);
        this._show(filterListEl);

        // 数据处理
        if (refine === 'country') {
            this._countryRefine = '';
        } else {
            this._categoryRefine = '';
        }

        this._getSearchPromise(1).done(function(returnData) {
            this.searchList = returnData;

            this._renderList();
        }.bind(this));
    },

    // 将搜索词显示到搜索框
    _pendSearchValToInp: function() {
        this._searchInpEl.val(this._getSearchVal('q'));
    },

    // 进入页面的一个最初的动作 & 搜索结果展示
    _judgeShow: function() {
        if (this.searchList.items && this.searchList.items.length) {
            this._noContentEl.hide();
            this._listContentEl.show();

            this._renderList();
        } else {
            this._listContentEl.hide();
            this._noContentEl.show();

            $$('[data-role="search-word"]').html(this.htmlEncode(this._getSearchVal('q')));
        }
    },

    _refineRender: function() {
        this._refineCountryEl.html(handlebars.compile(refineCountryTpl)({
            list: this._getRefineCountryList()
        }));

        this._refineCategoryEl.html(handlebars.compile(refineCategoryTpl)({
            list: this._getIndustryList()
        }));

        // 显示过滤样式
        this._initFilterShow();
    },

    // 初始化左侧的过滤显示
    _initFilterShow: function() {
        var country = this._getSearchVal('country');
        var industry = this._getSearchVal('industry');

        if (country) {
            this._filterElShow($$('[data-refine="country"][data-val="' + country + '"]'));
        }

        if (industry) {
            this._filterElShow($$('[data-refine="category"][data-val="' + industry + '"]'));
        }
    },

    _getRefineCountryList: function() {
        var ary = [];

        $.each(this.refineCountryList || [], function(index, item) {
            if (item.country && item.value) {
                ary.push(item);
            }
        });

        return ary;
    },

    _getIndustryList: function() {
        var ary = [];

        $.each(this.refineIndustryList || [], function(index, item) {
            if (item.industryDetails) {
                ary.push(item.industryDetails);
            }
        });

        return ary;
    },

    // 统一入口方法
    _getSearchPromise: function(to, searchVal, country, industry) {
        to = to || 1;

        return this.send({
            url: this.get('listReqUrl'),
            type: 'GET',
            data: this._getListReqData(to, searchVal, country, industry),
            dataType: 'json'
        }).then(function(returnData) {
            // 保存住当前搜索词，给refine使用
            this._searchVal = searchVal;

            this.refineCountryList = returnData.refine.refineCountryList;
            this.refineIndustryList = returnData.refine.refineIndustryList;

            return (this.searchList = returnData);
        }.bind(this));
    },

    // 翻页
    _turnPage: function(to, _self) {
        _self = _self || this._pagination;

        this._getSearchPromise(to).done(function(returnData) {
            document.body.scrollTop = 0;

            _self.set('current', this._curPage = to);
            this.searchList = returnData;

            this._renderList();
        }.bind(this));
    },

    // 获取list请求数据
    _getListReqData: function(currentPage, searchVal, country, industry) {
        currentPage = currentPage || this._curPage;
        searchVal = searchVal || this._getSearchVal('q');

        country = country || this._countryRefine;
        industry = industry || this._categoryRefine;


        var reqData = {
            start: (currentPage - 1) * this.searchList.num,
            q: searchVal,
            pageSize: this._pageSize,
            biz: ''
        };

        /**
        $.each(this.searchList.items || [], function(index, item) {
            return !(reqData.biz = item.bizType);
        });
        */

        if (country) {
            reqData.country = country;
        }

        if (industry) {
            reqData.industry = industry;
        }

        return reqData;
    },

    // 渲染list列表通用函数
    _renderList: function() {
        var len = this.searchList.items.length;

        this._searchNumEl.html(this.searchList.total);
        this._searchedResTextEl.html(len > 1 ? ' companies found' : ' company found');
        console.log('searchlist', this.searchList);
        var renderHtml = handlebars.compile(listTpl)(this.searchList);

        this._listContainerEl.html(renderHtml);

        this._renderImgs();
        this._renderExhiHisPics();
        this._getWatchList();
        this._getConnectedList();
        this._initPagination();

        this._refineRender();
    },

    _renderImgs: function() {
        var items = this.searchList.items;

        $$('[data-role="right-pictures"]').each(function(index, picParEl) {
            picParEl = $$(picParEl);

            var leftEl = picParEl.closest('[data-role="list-item"]').find('[data-role="list-item-left"]');

            var dataAry = items[index].slideShowImgUrls || [];
            var dataAryLen = dataAry.length;

            if (!dataAryLen) {
                picParEl.css({
                    'vertical-align': 'middle',
                    'font-size': '14px'
                }).html('');
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

                picParEl.css({
                    'vertical-align': 'middle'
                }).html(handlebars.compile(rightPictureThree)({
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
            var hisAry = (items[index].historicalExhibitions || []).slice(0, 5);

            $.each(hisAry || [], function(index, his) {
                ary.push('<a class="eh-history-ehibition" title="' + me.htmlEncode(his.name) + '" style="background-image: url(' + his.logoImgUrl + ');"></a>');
            });

            if (ary.length) {
                parEl.html(ary.join(''));
            }
        });
    },

    // 分页处理
    _initPagination: function() {
        this._paginationEl.html('');

        if (this.searchList.total) {
            this._pagination = new PaginationComplex({
                parentNode: this._paginationEl,
                total: Math.ceil(this.searchList.total / this._pageSize),
                current: this._curPage,
                pageEscape: '%page%'
            }).render();

            // 翻页
            this._pagination.on('turn', this._turnPage.bind(this));
        }

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
        this._refineCountryEl = $$('[data-val="refine-country"]');
        this._refineCategoryEl = $$('[data-val="refine-category"]');
        this._searchInpEl = $$('[data-role="search-inp"]');

        this._curPage = this._curPage || 1;
        this._pageSize = 36;

        this.searchList.items = this.searchList.items || [];
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
