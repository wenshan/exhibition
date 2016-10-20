var $ = require('alpha-jquery/jquery');
var handlebars = require('alpha-handlebars/handlebars');
var Widget = require('../../../common/js/widget-backend');
var Balloon = require('alpha-balloon/balloon');
var rightListTpl = require('./src/right-list.tpl');
var exhibitionTpl = require('./src/exhibition-history.tpl');
var connectedUserTpl = require('./src/personal-info.tpl');

var $$ = $;

handlebars.registerHelper('mainProducts', function(companyMainProducts) {
    if (!companyMainProducts.length) {
        return '';
    }

    var res = [];

    $.each(companyMainProducts, function(index, product) {
        res.push(product);
    });

    return '(' + res.join(' & ') + ')';
});

handlebars.registerHelper('lower', function(str) {
    return (str || '').toLowerCase();
});

handlebars.registerHelper('product', function(industryList) {
    return (industryList || []).join(' / ');
});

handlebars.registerHelper('picListRender', function(picList) {
    var ary = [];
    picList = (picList || []).slice(0, 5);

    $.each(picList, function(index, item) {
        ary.push('<li class="eh-exhibition-photo"><image src="' + item + '" class="ex-exhibition-pic"></li>');
    });

    return new handlebars.SafeString(ary.join(''));
});

handlebars.registerHelper('showConnectedList', function(connectUsers, participantUsers) {
    var ary = [];

    connectUsers = (connectUsers && connectUsers.length) ? connectUsers : participantUsers;
    connectUsers = connectUsers || [];

    $.each(connectUsers.slice(0, 5), function(index, item) {
        var itemStr = (item.photo || '').length ?
            '<li data-role="connected-user" data-id="' + item.id + '" class="eh-exhibitor-photo" style="background-image: url(' + item.photo + ')"></li>' :
            '<li data-role="connected-user" data-id="' + item.id + '" class="eh-exhibitor-photo">' + (item.userName && item.userName.charAt(0).toUpperCase() || '') + '</li>';

        ary.push(itemStr);
    });

    if (connectUsers.length > 5) {
        ary.push('<li class="eh-exhibitor-dot"></li>');
    }

    return new handlebars.SafeString(ary.join(''));
});

handlebars.registerHelper('showExhibitor', function(connectUsers, participantUsers) {
    connectUsers = connectUsers || [];
    participantUsers = participantUsers || [];

    return ((connectUsers.length > 1 || !connectUsers.length) ? 'Connections participating at this event.' : 'Connection participating at this event.') + (!connectUsers.length && participantUsers.length ? 'Some Exhibitors you may be interested in:' : '');
});

handlebars.registerHelper('dateExec', function(date) {
    date = date || '';

    return date.replace(/\-/g, '.');
});


handlebars.registerHelper('numberShow', function(num) {
    num = num || 0;

    // return num > 1000 ? '1000+' : num;
    return num;
});

handlebars.registerHelper('photoShow', function(userPhoto, userName) {
    var result = '';

    if (!userPhoto) {
        result = (userName || '').charAt(0).toUpperCase();
    }

    return result;
});

handlebars.registerHelper('showExhibitors', function(num) {
    return num !== 1 ? 'Exhibitions' : 'Exhibition';
});

handlebars.registerHelper('showvVisitors', function(num) {
    return num !== 1 ? 'Visitors' : 'Visitor';
});

var Index = Widget.extend({
    attrs: {
        personalInfoUrl: '/dashboard/ajax/user/detail.do',
        rightListInfoUrl: '/dashboard/ajax/connect/mySimpleList.do',
        exhibitionList: '/dashboard/ajax/exhibition/latestList.do',
        bizCardUrl: '/dashboard/ajax/user/bizCard.do'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initElements();
        this._reqPersonalInfo();
        this._reqRightListInfo();
        this._renderExhibitionList();
    },

    _initElements: function() {
        $$ = this.$.bind(this);

        this._exhibitionList = $$('[data-role="exhibition-list"]');
        this._noResult = $('#eh-search-404');

        this._curPage = this._curPage || 1;
    },

    // **个人信息展示
    _reqPersonalInfo: function() {
        var returnData = this._accountInfoData;

        this._accountInfoPromise.then(function(returnData) {
            // 三个通知
            $.each(['watchNumber', 'connectNumber', 'informNumber'], function(index, item) {
                $$('[data-role="' + item + '"]').text(returnData[item] > 99 ? '99+' : returnData[item]);
            });
        });
    },

    // **展示右侧信息列表
    _reqRightListInfo: function() {
        this.send({
            url: this.get('rightListInfoUrl'),
            data: {
                curPage: 1,
                pageSize: 6,
                scope: 2,
                status: 'Pending'
            }
        }).done(this._renderRightListInfo);
    },

    _renderRightListInfo: function(returnData) {
        returnData = returnData.data || {
            items: []
        };

        if (returnData.items && returnData.items.length) {
            returnData.items = returnData.items.slice(0, 4);

            $$('[data-role="right-list"]').html(handlebars.compile(rightListTpl)(returnData));
        } else {
            $$('[data-role="loading-helper"]').remove();
            $$('[data-role="right-no-result"]').css({
                'display': 'block'
            });
        }
    },

    // **展示中间展会列表
    _renderExhibitionList: function() {
        this.send({
            url: this.get('exhibitionList'),
            data: {
                curPage: this._curPage,
                pageSize: 3
            }
        }).then(function(returnData) {
            returnData.data.items = returnData.data.items || [];

            $.each(returnData.data.items, function(index, item) {
                item.connectUsers = item.connectUsers;
                item.connectUserNumber = item.connectUserNumber;
            });
            if(returnData.data.items.length == 0)
            {
                this._noResult.show();
                this._exhibitionList.hide();
            }
            else
            {
                this._exhibitionList.html(handlebars.compile(exhibitionTpl)(returnData.data));
            }
        }.bind(this)).then(this._addConnectedBalloon.bind(this));
    },

    _addConnectedBalloon: function() {
        var deferred = $.Deferred();

        $$('[data-role="connected-user"]').each(function(index, ietm) {
            var balloon = new Balloon({
                trigger: ietm,
                arrowPosition: 'br',
                width: 265,
                'min-height': 70,
                inViewport: true,
                content: function() {
                    return '<div>loading...</div>';
                }
            });

            balloon.before('show', function() {
                balloon.element.find('[data-role="content"]').html('<div>loading...</div>');
            });

            balloon.after('show', this._reqAndRenderUserInfo.bind(this, $$(ietm), balloon));
        }.bind(this));
    },

    _reqAndRenderUserInfo: function(activeTrigger, balloon) {
        var contentEl = balloon.element.find('[data-role="content"]');

        this.send({
            url: this.get('bizCardUrl'),
            data: {
                userId: activeTrigger.data('id')
            }
        }).done(function(returnData) {
            contentEl.html(handlebars.compile(connectedUserTpl)(returnData.data));
            var perPhotoEl = contentEl.find('[data-role="personal-photo"]');

            if (returnData.data.userPhoto) {
                perPhotoEl.css({
                    'background-image': 'url(' + returnData.data.userPhoto + ')'
                });
            } else {
                perPhotoEl.html((returnData.data.userName || '').charAt(0).toUpperCase());
            }

            balloon._setPosition();
        });
    }
});

module.exports = Index;
