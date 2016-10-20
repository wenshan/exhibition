var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var handlebars = require('scc-bp-handlebars/handlebars');
var IScroll = require('../../../common/components/iscroll/iscroll-lite');
var inform = require('../../dashboard/inform/index');

require('../../../common/components/zepto-modals/modals');

var goingItemTpl = require('./src/going-item.tpl');
var historyItemTpl = require('./src/history-item.tpl');
var statusTpl = require('./src/status.tpl');
var slideTpl = require('./src/slide.tpl');

var $$ = $;

handlebars.registerHelper('showDate', function(date) {
    return date.replace(/\-/g, '.');
});

handlebars.registerHelper('showLocation', function(boothRecordInfo) {
    return (boothRecordInfo || []).length ? boothRecordInfo[0].boothCode : '';
});

module.exports = Widget.extend({
    propsInAttrs: ['companyDetail', 'isLogined', 'companyId', 'userId'],

    attrs: {
        connectedUrl: '/dashboard/ajax/connect/connectCompanyList.do',

        statusUrl: '/dashboard/ajax/connect/connectUserList.do',
        statusUpdateUrl: '/dashboard/ajax/connect/updateStatus.do',
        connectUrl: '/dashboard/ajax/connect/addConnect.do',

        watchedListUrl: '/dashboard/ajax/watch/WatchCompanyList.do',
        addOrRemoveWatchUrl: '/dashboard/ajax/watch/updateWatch.do'
    },

    events: {
        'click [data-role="category-select"]': '_categorySelect',
        'click [data-role="connect-us"]': '_concatUs',
        'click [data-role="status-update"]': '_statusUpdate',
        'click [data-role="connect-button"]': '_connect',


        'click [data-role="watch"]': '_watchOrNot',
        'click [data-role="inform"]': '_inform'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._init();
        this._initData();

        this._informSet();
        this._watchStatus();
        this._renderCompany();
        this._initGallery();
        this._renderGoingList();
        this._renderHistory();
        this._renderBottomInfo();
        this._renderBottomConcat();
        this._renderMainProducts();
        this.initGoTop();

        console.log(this.companyDetail);
        console.log('userId:', this.userId);
    },

    _init: function() {
        $$ = this.$.bind(this);

        this._company = this.companyDetail.company;
        this._company.mainProducts = this._transMainProducts(this._company.mainProducts);

        this._isSelf = this.companyDetail.companyContact &&
            this.companyDetail.companyContact.id == this.userId;
    },

    _inform: function() {
        if (this.isLogined !== 'true') {
            this.jumpToLogin();
            return;
        }

        var companyContact = this.companyDetail.companyContact;

        inform.show({
            userId: companyContact.id,
            userName: companyContact.userName,
            userPhoto: companyContact.logo
        });
    },

    _watchOrNot: function(e) {
        if (this.isLogined !== 'true') {
            this.jumpToLogin();
            return;
        }

        var targetEl = $$(e.currentTarget);
        var watched = targetEl.data('watched');

        this.send({
            url: this.get('addOrRemoveWatchUrl'),
            data: {
                companyId: targetEl.data('val') || this._company.companyId,
                opt: watched ? 'unwatch' : 'watch'
            }
        }).then(function(returnData) {
            console.log(returnData);

            targetEl.text(watched ? 'Add to Watch List' : 'Remove from Watch List').data('watched', !watched);

            $.toast(watched ? 'Removed from Watch List' : 'Added to Watch List');
        });
    },

    // inform 与 add to my collection
    _informSet: function() {
        this._informEl = $$('[data-role="inform"]');
        this._addToWatchEl = $$('[data-role="watch"]');

        if (this._isSelf) {
            this._informEl.remove();
            this._addToWatchEl.css({
                width: '100%',
                'border-right': 'none'
            });
        }
    },

    // 判断是否已收入收藏
    _watchStatus: function() {
        this._collectBtn = this._addToWatchEl || $$('[data-role="watch"]');

        this.send({
            url: this.get('watchedListUrl'),
            data: {
                companyIds: this._company.companyId
            },
            type: 'GET'
        }).then(function(returnData) {
            console.log('watchList:', returnData);

            returnData = returnData.data[0];

            if (returnData.hasWatched) {
                this._collectBtn.text('Remove from Watch List').data('watched', true);
            } else {
                this._collectBtn.text('Add to Watch List').data('watched', false);
            }
        }.bind(this));
    },

    // TODO:
    _getConnected: function() {
        var connectedEl = $$('[data-role="connect-button"]');

        if (!connectedEl.length) {
            return;
        }

        var companyId = connectedEl.data('val') || this._company.companyId;

        this.send({
            url: this.get('connectedUrl'),
            data: {
                companyIds: companyId
            }
        }).then(function(reurnData) {
            reurnData = reurnData.data[0];

            connectedEl[reurnData.hasConnect ? 'addClass' : 'removeClass']('eh-connected').html(reurnData.hasConnect ? '<span class="eh-connected-status">Connected</span>' : '');
        });
    },

    _initData: function() {
        var mainProducts;

        if (this.companyDetail.company) {
            mainProducts = this.companyDetail.company.mainProducts;

            try {
                mainProducts = JSON.parse(mainProducts)[0];
            } catch (e) {
                mainProducts = this.companyDetail.company.mainProducts;
            }

            this.companyDetail.company.mainProducts = mainProducts;
        }
    },

    _categorySelect: function(e) {
        var targetEl = $$(e.currentTarget);
        var val = targetEl.attr('data-val');

        if (targetEl.hasClass('active')) {
            return;
        }

        $$('[data-role="category-select"].active').removeClass('active');

        targetEl.addClass('active');

        $$('[data-role="category-detail"].active').removeClass('active');
        $$('[data-role="category-detail"][data-val="' + val + '"]').addClass('active');
    },

    _renderMainProducts: function() {
        var company = this.companyDetail.company || {};
        var industries = this.companyDetail.industries;

        $$('[data-role="category-detail"][data-val="products"]').html(this.htmlEncode(company.mainProducts));

        var brands = [];

        $.each(this.companyDetail.brands || [], function(index, item) {
            brands.push(item.name);
        });

        $$('[data-role="category-detail"][data-val="brand"]').html(brands.join(' / '));
        $$('[data-role="category-detail"][data-val="industry"]').html(function() {
            var ary = [];

            $.each(industries || [], function(index, item) {
                ary.push(item.name);
            });

            return ary.join(' / ');
        });
    },

    _encode: function(str) {
        str = str || '';

        return str
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    },

    _renderCompany: function() {
        $$('[data-role="company-name"]').html(this._encode(this._company.name));
        $$('[data-role="company-locarion"]').html(this._encode([this._company.addressCity, this._company.addressCountryName].join(', ')));

        $$('[data-role="category-detail"][data-val="products"]').html(this._encode(this._company.mainProducts));
        $$('[data-role="category-detail"][data-val="brand"]').html(this._encode(this._company.email));
        $$('[data-role="category-detail"][data-val="industry"]').html(this._encode(this._company.bizType));
        $$('[data-role="company-aboutUs"]').html(this._encode(this._company.aboutUs));
    },

    _initGallery: function() {
        var ary = [];

        if (this.companyDetail.showcases && this.companyDetail.showcases.length) {
            this.companyDetail.showcases = this.companyDetail.showcases.slice(0, 12);

            $.each(this.companyDetail.showcases || [], function(index, item) {
                ary.push({
                    imageSrc: item
                });
            });

            this.companyDetail.showcases = ary;

            $$('[data-role="gallery-list"]').html(handlebars.compile(slideTpl)(this.companyDetail));

            this._galleryScroll = new IScroll('[data-role="gallery"]', {
                eventPassthrough: false,
                scrollX: true,
                scrollY: false,
                snap: false,
                momentum: true,
                deceleration: 0.0006,
                probeType: 2,
                scrollbars: false,
                mouseWheel: true,
                shrinkScrollbars: 'scale',
                tap: false
            });
        } else {
            $$('.eh-gallery').remove();
        }
    },

    _renderGoingList: function() {
        var listEl = $$('[data-role="going-list"]');
        var ongoingExhibitions = this.companyDetail.ongoingExhibitions;

        if (ongoingExhibitions && ongoingExhibitions.length) {
            listEl.html(handlebars.compile(goingItemTpl)(this.companyDetail));
        } else {
            $$('[data-role="going-area"]').remove();
        }
    },

    _renderHistory: function() {
        // historyItemTpl
        var listEl = $$('[data-role="history-list"]');
        var historicalExhibitions = this.companyDetail.historicalExhibitions;

        if (historicalExhibitions && historicalExhibitions.length) {
            listEl.html(handlebars.compile(historyItemTpl)(this.companyDetail));
        } else {
            $$('[data-role="history-area"]').remove();
        }

    },

    _renderBottomInfo: function() {
        var companyContact = this.companyDetail.companyContact;

        $$('[data-role="user-name"]').html(this._encode(companyContact.userName));
        $$('[data-role="user-position"]').html(this._encode(companyContact.position));
    },

    _concatUs: function(e) {
        this.jumpToLogin();
    },

    _renderBottomConcat: function() {
        if (this.isLogined) {
            if (this.companyDetail.companyContact && this.companyId == this.companyDetail.companyContact.companyId) {

                $$('[data-role="connect-operations"]').remove();
                return;
            }

            var containerEl = $$('[data-role="connect-operations"]');
            var userIds = this.companyDetail.companyContact && this.companyDetail.companyContact.id;

            userIds && this.send({
                url: this.get('statusUrl'),
                data: {
                    userIds: userIds
                },
                type: 'GET'
            }).then(function(statusList) {
                console.log(statusList);
                statusList = statusList.data[0];

                containerEl.html(handlebars.compile(statusTpl)(statusList));
            }.bind(this));
        }

        this._getConnected();
    },

    _connect: function(e) {
        var targetEl = $$(e.currentTarget);
        var userId = String(targetEl.data('val'));

        this.send({
            url: this.get('connectUrl'),
            data: {
                userId: userId
            }
        }).then(function(returnData) {
            targetEl.parent().html('<span class="eh-waiting-status">Waiting for response</span>');
        });
    },

    _statusUpdate: function(e) {
        var targetEl = $$(e.currentTarget);
        var parEl = targetEl.parent();
        var opt = targetEl.data('val');
        var userId = targetEl.data('id');

        var data = {
            opt: opt,
            userId: userId
        };

        this.send({
            url: this.get('statusUpdateUrl'),
            data: data
        }).then(function(returnData) {
            if (opt === 'accept') {
                parEl.html('<span class="eh-connected-status">Connected before</span>');
            } else {
                parEl.html('<a data-val="' + userId + '" data-role="connect-button" class="eh-connect">connect</a>');
            }
        });
    },

    _transMainProducts: function(mainProducts) {
        var main;

        try {
            main = JSON.parse(mainProducts).join(' / ');
        } catch (e) {
            main = mainProducts;
        }

        return main;
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
