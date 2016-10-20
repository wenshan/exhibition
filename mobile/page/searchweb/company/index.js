var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var handlebars = require('alpha-handlebars/handlebars');
var IScroll = require('/mobile/common/components/iscroll/iscroll-lite');

var searchItemTpl = require('./src/item.tpl');
var refineCountryTpl = require('./src/refine-country.tpl');
var refineCategoryTpl = require('./src/refine-category.tpl');

require('../../../common/components/zepto-modals/modals');

handlebars.registerHelper('safeString', function(str) {
    return new handlebars.SafeString(str);
});

// 渲染图片
handlebars.registerHelper('productPics', function(slideShowImgUrls) {
    slideShowImgUrls = slideShowImgUrls || [];
    slideShowImgUrls = slideShowImgUrls.slice(0, 3);
    var renderStr = '';

    $.each(slideShowImgUrls, function(index, item) {
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


handlebars.registerHelper('showAttended', function(historicalExhibitionIds) {
    var len = historicalExhibitionIds ? historicalExhibitionIds.length : 0;

    return len + (len === 1 ? ' event' : ' events');
});

var $$ = $;
module.exports = Widget.extend({
    propsInAttrs: ['userId', 'searchList', 'refineCountryList', 'refineIndustryList', 'isLogined'],

    attrs: {
        listReqUrl: '/company/api/search',
        connectedUrl: '/dashboard/ajax/connect/connectCompanyList.do',
        watchReqUrl: '/dashboard/ajax/watch/updateWatch.do',
        watchedOrNotUrl: '/dashboard/ajax/watch/WatchCompanyList.do'
    },

    events: {
        'click [data-role="refine"]': '_popup',
        'click [data-role="ope-btn"]': '_watchOrCancel'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initElements();
        this._renderSearchInpVal();
        this._renderList();

        // 确保这个事件最后初始化
        this._addScrollLoad();
        this.initGoTop();
    },
    _initElements: function() {
        $$ = this.$.bind(this);

        this._listEl = $$('[data-role="list-container"]');

        this._curPage = 2;
        this._searchVal = this._getSearchVal('q');

        this._viewMoreLoadingEl = $$('[data-role="view-more-loading"]');
        this._viewMoreEl = $$('[data-role="view-more"]');
        this._searchNum = this.searchList.num || 36;

        this._selectedCountryEl = $('[data-role="country-seled"]');
        this._selectedCategoryEl = $('[data-role="category-seled"]');

        this._selectedCountry = this._getSearchVal('country');
        this._selectedCategory = this._getSearchVal('industry');

        this._countryListEl = $('[data-role="refine-list-country"]');
        this._categoryListEl = $('[data-role="refine-list-category"]');

        this._pageSize = 36;

        this._originCountryList = this.refineCountryList;
        this._originIndustryList = this.refineIndustryList;
    },

    _watchOrCancel: function(e) {
        e.preventDefault();

        if (this.isLogined !== 'true') {
            this.jumpToLogin();

            return;
        }

        var targetEl = $$(e.currentTarget);
        var isWatching = targetEl.attr('data-watched') === 'true';

        this.send({
            url: this.get('watchReqUrl'),
            data: {
                companyId: targetEl.attr('data-btn-id'),
                opt: isWatching ? 'unwatch' : 'watch'
            }
        }).done(function(returnData) {
            $.toast(isWatching ? 'Removed from Watch List' : 'Added to Watch List');

            targetEl.attr('data-watched', !isWatching).text(isWatching ? 'Added to Watch List' : 'Removed from Watch List');
        });
    },

    _popup: function() {
        $.popup('[data-role="popup"]');

        this._initPopup();
    },

    // 初始化refine的popup
    _initPopup: function() {

        var isInFirst = true;
        var me = this;

        var backEl = $('[data-role="popup-back"]');
        var firstUlEl = $('[data-role="refine-list"]');
        var countryUlEl = $('[data-role="refine-list-country"]');
        var categoryUlEl = $('[data-role="refine-list-category"]');
        var resetEl = $('[data-role="popup-reset"]');
        var confirmEl = $('[data-role="confirm"]');
        var resetAllEl = $('[data-role="reset-all"]');
        var popupEl = $('[data-role="popup"]');


        function back() {
            if (isInFirst) {
                $.closeModal('[data-role="popup"]');
            } else {
                countryUlEl.hide();
                categoryUlEl.hide();

                firstUlEl.show();
                resetEl.show();

                isInFirst = true;
            }
        }

        popupEl.on('tap', '[data-role="refine-last-item"]', function(e) {
            var targetEl = $(e.currentTarget);

            var parEl = targetEl.closest('ul');
            var val = parEl.attr('data-val');

            parEl.find('[data-role="refine-last-item"]').removeClass('selected');

            targetEl.addClass('selected');

            if (val === 'country') {
                me._selectedCountry = targetEl.attr('data-val');
            } else {
                me._selectedCategory = targetEl.attr('data-val');
            }

            me._renderSelectedCountryAndCategory();

            back();

            return false;
        });

        backEl.on('click', back);

        $('[data-role="refine-item"]').on('click', function(e) {
            firstUlEl.hide();
            backEl.show();

            var targetEl = $(e.currentTarget);

            if (targetEl.attr('data-val') === 'country') {
                countryUlEl.show();
                categoryUlEl.hide();

                if (this._countryScroll) {
                    this._countryScroll.refresh();
                } else {
                    this._countryScroll = this._initPopupScroll('[data-role="refine-list-country"]');
                }

            } else {
                countryUlEl.hide();
                categoryUlEl.show();

                if (this._categoryScroll) {
                    this._categoryScroll.refresh();
                } else {
                    this._initPopupScroll('[data-role="refine-list-category"]');
                }

            }

            resetEl.hide();

            isInFirst = false;
        }.bind(this));

        resetEl.on('click', function(e) {
            var targetEl = $(e.currentTarget);

            popupEl.find('[data-role="refine-last-item"].selected').removeClass('selected');

            this._selectedCountry = this._selectedCategory = null;

            this.refineCountryList = this._originCountryList;
            this.refineIndustryList = this._originIndustryList;

            this._renderRefineList();
            this._renderSelectedCountryAndCategory();
        }.bind(this));

        resetAllEl.on('click', function(e) {
            this._selectedCountry = this._selectedCategory = null;
            this._renderSelectedCountryAndCategory();
        }.bind(this));

        confirmEl.on('click', function(e) {
            this._curPage = 1;
            this._viewMoreEl.hide();
            this._listEl.html('').append([
                '<li class="eh-loading-helper" data-role="list-loading-helper">',
                '<span class="eh-loading-pic"></span><span class="eh-loading-text">Loading......</span>',
                '</li>'
            ].join(''));

            $('[data-role="view-more"]').hide();

            this._getSearchList(this._selectedCountry, this._selectedCategory);

            $.closeModal('[data-role="popup"]');
        }.bind(this));

        this._renderRefineList();

        this._renderSelectedCountryAndCategory();
    },

    _initPopupScroll: function(el) {
        return new IScroll(el, {
            eventPassthrough: false,
            scrollX: false,
            scrollY: true,
            snap: false,
            momentum: true,
            deceleration: 0.0006,
            probeType: 2,
            scrollbars: false,
            mouseWheel: true,
            shrinkScrollbars: 'scale',
            tap: false
        });
    },

    _renderRefineList: function() {
        var countryListEl = $('[data-role="refine-list-country"] [data-role="refine-list-container"]');
        var categoryListEl = $('[data-role="refine-list-category"] [data-role="refine-list-container"]');

        countryListEl.find('[data-role="refine-last-item"]').remove();
        categoryListEl.find('[data-role="refine-last-item"]').remove();

        countryListEl.append(handlebars.compile(refineCountryTpl)({
            list: this._getRefineCountryList()
        }));

        categoryListEl.append(handlebars.compile(refineCategoryTpl)({
            list: this._getIndustryList()
        }));
    },

    _renderSelectedCountryAndCategory: function() {
        var obj;

        if (this._selectedCountry) {
            obj = this._getIdObj(this._selectedCountry, this.refineCountryList, 'value');

            if (obj) {
                this._selectedCountryEl.attr('data-val', this._selectedCountry).text(obj.country);
            }

            // 渲染已选中
            this._countryListEl.find('[data-val="' + this._selectedCountry + '"]').addClass('selected');
        } else {
            this._countryListEl.find('.selected').removeClass('selected');
            this._selectedCountryEl.attr('data-val', '').text('ALL');
        }

        if (this._selectedCategory) {
            obj = this._getIdObj(this._selectedCategory, this.refineIndustryList, 'id');
            if (obj) {
                this._selectedCategoryEl.attr('data-val', this._selectedCategory).text(obj.name);
            }

            // 渲染已选中
            this._categoryListEl.find('[data-val="' + this._selectedCategory + '"]').addClass('selected');
        } else {
            this._categoryListEl.find('.selected').removeClass('selected');
            this._selectedCategoryEl.attr('data-val', '').text('ALL');
        }
    },

    _getIdObj: function(id, ary, prop) {
        var obj;

        $.each(ary || [], function(index, item) {
            if (item[prop] == id) {
                obj = item;

                return false;
            }
        });

        return obj;
    },

    _getRefineCountryList: function() {
        var ary = [];
        console.log(this.refineCountryList);
        $.each(this.refineCountryList || [], function(index, item) {
            if (item.country && item.value) {
                ary.push(item);
            }
        });

        return (this.refineCountryList = ary);
    },

    _getIndustryList: function() {
        var ary = [];

        $.each(this.refineIndustryList || [], function(index, item) {
            if (item.industryDetails) {
                ary.push(item.industryDetails);
            }
        });

        return (this.refineIndustryList = ary);
    },

    _renderSearchInpVal: function() {
        $$('[data-role="search-inp"]').val(this._searchVal);
    },

    _getSearchList: function(country, industry) {
        this._loadedAll = false;

        this._ajax = this.send({
            url: this.get('listReqUrl'),
            type: 'GET',
            data: this._getListReqData(country, industry),
            dataType: 'json'
        }).then(function(returnData) {
            // 将searchList更新为最新的list列表数据
            this.searchList = returnData;

            console.log('searchList: ', returnData);

            if (((this._curPage - 1) * this._searchNum) + returnData.num >= returnData.total) {
                this._viewMoreEl.show();
                this._loadedAll = true;
            } else {
                // 更新当前页码并自动触发列表渲染
                this._curPage++;
            }

            this.refineCountryList = returnData.refine.refineCountryList;
            this.refineIndustryList = returnData.refine.refineIndustryList;

            this._renderList();
        }.bind(this)).always(function() {
            this._ajax = null;
            this._viewMoreLoadingEl.hide();
        }.bind(this));
    },

    _getListReqData: function(country, industry) {
        var currentPage = this._curPage || 1;
        var searchVal = this._searchVal;

        country = country || this._countryRefine;
        industry = industry || this._categoryRefine;

        var reqData = {
            start: (currentPage - 1) * this._searchNum,
            q: searchVal,
            pageSize: this._pageSize,
            biz: ''
        };

        // 获取biz值
        // $.each(this.searchList.items || [], function(index, item) {
        //     return !(reqData.biz = item.bizType);
        // });

        if (country) {
            reqData.country = country;
        }

        if (industry) {
            reqData.industry = industry;
        }

        return reqData;
    },

    _renderList: function() {
        this._curPage = this._curPage || 1;

        // 能用js数据解决的问题绝不动用DOM操作（查询）
        var helperEl = this._listEl.find('[data-role="list-loading-helper"]');

        if (this._curPage === 1 || helperEl.length) {
            helperEl.remove();
        }

        this.searchList.btnOpt = this.isLogined === 'true';

        $$('[data-role="res-num"]').html(this.searchList.total);

        if (this.searchList.total) {
            this._listEl.append(handlebars.compile(searchItemTpl)(this.searchList));
        } else {
            $('[data-role="search-word"]').html(this._getSearchVal('q'));
            $('[data-role="no-content-show"]').show();

            return;
        }

        this._getWatchList();
        this._getConnectedList();

        this._scrollToTop();
    },

    // list渲染后获取是否已经取得联系
    _getConnectedList: function() {
        var compIds = this._getComponyIds().join(',');
        var connectedClass = 'eh-connect';

        if (this.isLogined !== 'true') {
            $$('[data-role="connection"]').remove();

            return;
        }

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

    // list渲染后获取是否是watched
    _getWatchList: function() {
        var compIds = this._getComponyIds().join(',');

        compIds && (this.isLogined === 'true') && this.send({
            url: this.get('watchedOrNotUrl'),
            data: {
                companyIds: compIds
            },
            type: 'GET'
        }).done(function(returnData) {
            returnData = returnData.data || [];

            returnData.length && $.each(returnData, function(index, item) {
                $$('[data-role="ope-btn"][data-btn-id="' + item.companyId + '"]')
                    .text(item.hasWatched ? 'Remove from my Watch List' : 'Add to My Watch List')
                    .attr('data-watched', item.hasWatched);
            });
        });
    },

    _getComponyIds: function() {
        var compIds = [];

        $.each(this.searchList.items || [], function(index, item) {
            compIds[compIds.length] = item.companyId;
        });

        return compIds;
    },

    _addScrollLoad: function() {
        var bodyEl = $(document.body);
        var $window = $(window);

        $window.scroll(function(e) {
            // 正在加载中就不再加载
            if (this._ajax || this._loadedAll) {
                return;
            }

            this._scrollId && clearTimeout(this._scrollId);

            // 执行函数节流
            this._scrollId = setTimeout(function() {
                var viewH = $window.height();
                var contentH = bodyEl[0].scrollHeight;
                var scrollTop = bodyEl.scrollTop();

                if (contentH - viewH - scrollTop <= 80) {
                    this._viewMoreLoadingEl.show();
                    document.body.scrollTop += document.body.scrollTop + this._viewMoreLoadingEl.height();

                    this._getSearchList();
                }

            }.bind(this), 16);
        }.bind(this));
    },

    _judgePush: function(ary, id) {
        if (ary.indexOf(id) === -1) {
            ary.push(id);
        }
    },

    _scrollToTop: function() {
        if (this._hasScrolled) {
            return;
        }

        this._hasScrolled = true;

        setTimeout(function() {
            document.body.scrollTop = 0;
        }, 40);
    }
});
