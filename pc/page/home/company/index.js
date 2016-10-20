var $ = require('@alife/alpha-jquery/jquery');
var PaginationComplex = require('alpha-pagination/pagination-complex');
var handlebars = require('scc-bp-handlebars/handlebars');
var Widget = require('../../../common/js/widget-backend');
var messageTip = require('scc-bp-message-tip/message-tip');
var Slide = require('../../../common/slide/slide');
var $$ = $;

var companyTpl = require('./src/company.tpl');
var slideTpl = require('./src/slide.tpl');
var goingTpl = require('./src/going.tpl');
var historyTpl = require('./src/history.tpl');
var statusTpl = require('./src/status.tpl');

var inform = require('../../dashboard/inform/index');

handlebars.registerHelper('showDate', function(date) {
    date = date || '';

    return date.replace(/\-/g, '.');
});

handlebars.registerHelper('showLocation', function(boothRecordInfo) {
    return (boothRecordInfo || []).length ? boothRecordInfo[0].boothCode : '';
});

handlebars.registerHelper('showOneProduct', function(mainProducts) {
    return mainProducts[0];
});



var Index = Widget.extend({
    propsInAttrs: ['companyDetail', 'isLogined', 'companyId'],

    setup: function() {
        Index.superclass.setup.call(this);
        this._init();

        // 渲染公司详情
        this._renderCompany();
        this._initSlide();
        this._renderGoingList();
        this._renderHistoryExhs();
        this._renderBottomInfo();
        this._renderCollectButton();


        this._resizeTitle();

        this.on('accountRendered', function(returnData) {
            this._isSelf = returnData.userId && this.companyDetail && this.companyDetail.companyContact && this.companyDetail.companyContact.id && (this.companyDetail.companyContact.id == returnData.userId);

            this._renderBottomConcat();

            this.trigger('hooks');
        }.bind(this));

        console.log('companyDetail:', this.companyDetail);
    },

    attrs: {
        companyDetail: {},
        connectedUrl: '/dashboard/ajax/connect/connectCompanyList.do',
        statusUrl: '/dashboard/ajax/connect/connectUserList.do',
        statusUpdateUrl: '/dashboard/ajax/connect/updateStatus.do',
        connectUrl: '/dashboard/ajax/connect/addConnect.do',

        watchedListUrl: '/dashboard/ajax/watch/WatchCompanyList.do',
        addOrRemoveWatchUrl: '/dashboard/ajax/watch/updateWatch.do'
    },

    events: {
        'click [data-role="expand"]': '_expand',
        'click [data-role="shrink"]': '_shrink',
        'click [data-role="connect-us"]': '_concatUs',
        'click [data-role="status-update"]': '_statusUpdate',
        'click [data-role="connect-button"]': '_connect',
        'click [data-role="collect"]': '_watchOrNot',
        'click [data-role="inform"]': '_inform'
    },

    _init: function() {
        $$ = this.$.bind(this);

        this._initData();
    },

    _initData: function() {
        var mainProducts;

        if (this.companyDetail.company) {
            mainProducts = this.companyDetail.company.mainProducts;

            try {
                mainProducts = JSON.parse(mainProducts);
            } catch (e) {
                mainProducts = this.companyDetail.company.mainProducts;
            }

            this.companyDetail.company.mainProducts = mainProducts;
        }
    },

    _inform: function() {
        if (this.isLogined !== 'true') {

            this.setLoginedCb('_inform');

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

    _renderCollectButton: function() {
        this._collectBtn = $$('[data-role="collect"]');

        this.send({
            url: this.get('watchedListUrl'),
            data: {
                companyIds: this._collectBtn.data('val')
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

    _watchOrNotFunc: function() {
        $$('[data-role="collect"]').trigger('click');
    },

    _watchOrNot: function(e) {
        if (this.isLogined !== 'true') {

            this.setLoginedCb('_watchOrNotFunc');

            this.jumpToLogin();
            return;
        }

        var targetEl = $$(e.currentTarget);
        var watched = targetEl.data('watched');

        this.send({
            url: this.get('addOrRemoveWatchUrl'),
            data: {
                companyId: targetEl.data('val'),
                opt: watched ? 'unwatch' : 'watch'
            }
        }).then(function(returnData) {
            console.log(returnData);

            targetEl.text(watched ? 'Add to Watch List' : 'Remove from Watch List').data('watched', !watched);

            messageTip.success(watched ? 'Removed from Watch List' : 'Added to Watch List');
        });
    },

    _initSlide: function() {
        var ary = [];

        if (this.companyDetail.showcases && this.companyDetail.showcases.length) {
            this.companyDetail.showcases = this.companyDetail.showcases.slice(0, 12);

            $.each(this.companyDetail.showcases || [], function(index, item) {
                ary.push({
                    imageSrc: item
                });
            });

            this.companyDetail.showcases = ary;

            $$('[data-role="slide-move"]').html(handlebars.compile(slideTpl)(this.companyDetail));

            var slide = new Slide({
                element: '[data-role="slide-container"]',
                fragmentNum: 4
            });
        } else {
            $$('[data-role="gallery"]').remove();
        }
    },

    _renderCompany: function() {
        var company = this.companyDetail.company;
        var ulEl = $$('[data-role="company"]');

        ulEl.html(handlebars.compile(companyTpl)(company));

        this._renderCompanyOtherInfo();
    },

    _getConnected: function() {
        var connectedEl = $$('[data-role="connected"]');

        if (!connectedEl.length) {
            return;
        }

        var companyId = connectedEl.data('val');

        this.send({
            url: this.get('connectedUrl'),
            data: {
                companyIds: companyId
            }
        }).then(function(reurnData) {
            reurnData = reurnData.data[0];

            connectedEl[reurnData.hasConnect ? 'addClass' : 'removeClass']('eh-connected').html(reurnData.hasConnect ? 'Connected' : '');
        });
    },

    _renderCompanyOtherInfo: function() {
        var company = this.companyDetail.company || {};
        var industries = this.companyDetail.industries;
        var aboutUsEl = $$('[data-role="company-aboutUs"]');
        var maxHeight = 70;
        var maxHeightSet = 89;

        if (company.sideViewImg && company.sideViewImg.length) {
            $$('[data-role="overview-left"]').css({
                'background-image': 'url(' + company.sideViewImg + ')'
            });

            $$('[data-role="overview-container"]').addClass('has-pic');
        } else {
            $$('[data-role="why-us"]').remove();
        }

        aboutUsEl.css({
            visibility: 'hidden'
        }).html((company.aboutUs || '')
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"));

        if (aboutUsEl.height() >= maxHeight) {
            var height = aboutUsEl.height();

            aboutUsEl.css({
                'height': maxHeightSet + 'px'
            });

            var vieMoreEl = $$('[data-role="view-more"]').show();

            vieMoreEl.on('click', function(e) {
                var val = vieMoreEl.data('val');

                if (val === 'shrink') {
                    aboutUsEl.css({
                        'height': height + 'px'
                    });

                    vieMoreEl.html('Less <span class="eh-arrow-down">d</span>').data('val', 'expand');
                } else {
                    aboutUsEl.css({
                        'height': maxHeightSet + 'px'
                    });

                    vieMoreEl.html('View More <span class="eh-arrow-down">c</span>').data('val', 'shrink');
                }
            });
        }

        aboutUsEl.css({
            visibility: 'visible'
        });

        var products = company.mainProducts.join && company.mainProducts.join(' / ') || company.mainProducts;
        $$('[data-role="company-mainProducts"]').html(this.htmlEncode(products)).attr('title', products);

        $$('[data-role="company-industry"]').html(function() {
            var ary = [];

            $.each(industries || [], function(index, item) {
                ary.push(item.name);
            });

            return ary.join(' / ');
        });

        var brands = [];

        $.each(this.companyDetail.brands || [], function(index, item) {
            brands.push(item.name);
        });

        $$('[data-role="company-bizType"]').html(brands.join(' / '));
    },

    // 渲染going List
    _renderGoingList: function() {
        // goingTpl
        var ulEl = $$('[data-role="going-list"]');
        var companyDetail = this.companyDetail;

        if (companyDetail.ongoingExhibitions && companyDetail.ongoingExhibitions.length) {
            ulEl.html(handlebars.compile(goingTpl)(companyDetail));

            $$('[data-role="shrink-par"]:not(:first)').show();
            $$('[data-role="expand-par"]:not(:first)').hide();
        } else {
            $$('[data-role="going"]').remove();
        }
    },

    _expand: function(e) {
        var targetEl = $$(e.currentTarget);
        var parEl = targetEl.closest('[data-role="going-item"]');

        $$('[data-role="expand-par"]:visible').slideUp();
        $$('[data-role="shrink-par"]:hidden').slideDown();

        parEl.find('[data-role="shrink-par"]').slideUp();
        parEl.find('[data-role="expand-par"]').slideDown();
    },

    _shrink: function(e) {
        var targetEl = $$(e.currentTarget);
        var parEl = targetEl.closest('[data-role="going-item"]');

        $$('[data-role="shrink-par"]:hidden').slideDown();
        $$('[data-role="expand-par"]:visible').slideUp();

        parEl.find('[data-role="expand-par"]').slideUp();
        parEl.find('[data-role="shrink-par"]').slideDown();
    },

    _resizeTitle: function() {
        var helper = 530;
        var helper1 = 980;
        var helper1Sec = 188;

        $$('[data-role="resize-title"]').css({
            'max-width': $(window).width() - helper + 'px'
        });

        $$('[data-role="history-title"]').css({
            'max-width': ($(window).width() - helper1) / 3 + helper1Sec + 'px'
        });

        $(window).resize(function() {
            $$('[data-role="resize-title"]').css({
                'max-width': $(window).width() - helper + 'px'
            });

            $$('[data-role="history-title"]').css({
                'max-width': ($(window).width() - helper1) / 3 + helper1Sec + 'px'
            });
        });
    },

    _renderHistoryExhs: function() {
        var companyDetail = this.companyDetail;
        var ulEl = $$('[data-role="history"]');

        if (companyDetail.historicalExhibitions && companyDetail.historicalExhibitions.length) {
            ulEl.html(handlebars.compile(historyTpl)(companyDetail));
        } else {
            $$('[data-role="eh-history"]').remove();

            if (!(companyDetail.ongoingExhibitions && companyDetail.ongoingExhibitions.length)) {
                $$('.eh-news').remove();
            }
        }
    },

    _renderBottomInfo: function() {
        var companyContact = this.companyDetail.companyContact || {};
        var name = this.htmlEncode(companyContact.userName);
        $$('[data-role="company-user-name"]').html(name).attr('title', name);
        $$('[data-role="company-user-position"]').html(companyContact.position);
    },

    _concatUs: function(e) {
        this.jumpToLogin();
    },

    _renderBottomConcat: function() {
        var isSelf = this._isSelf;

        if (isSelf && this.isLogined === 'true') {
            $$('[data-role="inform"]').remove();
        } else {
            $$('[data-role="inform"]').show().css({
                display: 'inline-block'
            });
        }

        if (this.isLogined === 'true') {
            if (isSelf) {
                $$('[data-role="connect-operations"]').remove();
                $$('[data-role="connected"]').remove();
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
        } else {
            $$('[data-role="connected"]').remove();
        }

        this._getConnected();
    },

    _connectFunc: function() {
        $$('[data-role="connect-button"]').trigger('click');
    },

    _connect: function(e) {
        if (this.isLogined !== 'true') {

            this.setLoginedCb('_connectFunc');

            this.jumpToLogin();
            return;
        }

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
                parEl.html('<a data-role="connect-button" data-val="' + userId + '" class="ui2-button ui2-button-default ui2-button-primary ui2-button-medium">connect</a>');
            }

        });
    }
});

module.exports = Index;
