var $ = require('alpha-jquery/jquery');
var handlebars = require('scc-bp-handlebars/handlebars');
var Widget = require('../../../common/js/widget-backend');
var messageTip = require('scc-bp-message-tip/message-tip');
var LoadingPanel = require('alpha-loading-panel/loading-panel');
var Overlay = require('./src/overlay');
var Slide = require('../../../common/slide/slide');
var loadingPanelI18n = require('./src/i18n');
var moment = require('alpha-moment/moment');

var selectTpl = require('./src/select.tpl');
var exhibitionHeaderTpl = require('./src/exhibition-header.tpl');
var exhibitionDetailTpl = require('./src/exhibition-detail.tpl');

var receivedListTpl = require('./src/receive-list.tpl');
var sentListTpl = require('./src/sent-list.tpl');

// var listNoResultTpl = require('./src/no-result.tpl');
// var listNoResultTpl = $('[data-role="no-result-hidden"]').html();

var receiveStatusTpl = require('./src/receive-status.tpl');
var sentTSatusTpl = require('./src/sent-status.tpl');

var MessageBalloon = require('./src/messages-balloon/balloon');

var $$ = $;

handlebars.registerHelper('showCatList', function(industryList) {
    industryList = industryList || [];

    var ary = [];

    $.each(industryList, function(index, item) {
        ary.push(item.name);
    });

    return ary.join(' / ');
});

handlebars.registerHelper('showExhibitions', function(exhibitorNumber) {
    return exhibitorNumber !== 1 ? 'Exhibitors' : 'Exhibitor';
});

handlebars.registerHelper('showVistors', function(visitorNumber) {
    return visitorNumber !== 1 ? 'Visitors' : 'Visitor';
});

handlebars.registerHelper('showNum', function(num) {
    // return num > 1000 ? '1000+' : num;
    return num;
});

handlebars.registerHelper('showName', function(photo, name) {
    return photo && photo.length ? '' : (name.charAt(0) || '').toUpperCase();
});

module.exports = Widget.extend({

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initElements();

        this._initPanels();
        this._initOverlay();
        this._subscribeEvents();

        this._initExhibitionList();
    },

    attrs: {
        exhibitionListUrl: '/dashboard/ajax/inform/exhibitionsInvolved.do',
        receivedListUrl: '/dashboard/ajax/inform/messagesReceived.do',
        sentListUrl: '/dashboard/ajax/inform/messagesSent.do',
        statusUrl: '/dashboard/ajax/connect/connectUserList.do',
        statusUpdateUrl: '/dashboard/ajax/connect/updateStatus.do',
        connectUrl: '/dashboard/ajax/connect/addConnect.do',

        pageSize: 20,

        receivedCurPage: {
            value: 1,

            getter: function(val) {
                return this._receivedCurPage || val;
            },

            setter: function(val) {
                this._receivedCurPage = val;

                this._getReceivedInformList();
            }
        },

        sentCurPage: {
            value: 1,

            getter: function(val) {
                return this._sentCurPage || val;
            },

            setter: function(val) {
                this._sentCurPage = val;

                this._getSentInformList();
            }
        }
    },

    events: {
        'click [data-role="slide-item"]': '_exhibitionSelect',
        'click [data-role="view-more"]': '_viewMoreList',
        'click [data-role="status-update"]': '_statusUpdate',
        'click [data-role="connect-button"]': '_connect',
        'click [data-role="messages"]': '_messageBalloon'
    },

    _initElements: function() {
        $$ = this.$.bind(this);

        this._selectEl = $$('[data-role="select"]');
        this._moveEl = $$('[data-role="slide-move"]');
        this._exhibitionDetailEl = $$('[data-role="exhibition-detail"]');


        this._receivedEl = $$('[data-role="received"]');
        this._sentEl = $$('[data-role="sent"]');
        this._receivedListEl = this._receivedEl.find('[data-role="receive-list"]');
        this._sentListEl = this._sentEl.find('[data-role="receive-list"]');
        this._receivedFooter = this._receivedEl.find('[data-role="view-more"]');
        this._sentFooter = this._sentEl.find('[data-role="view-more"]');

        this._receivedListNum = this._receivedEl.find('[data-role="list-num"]');
        this._receivedNotEl = this._receivedEl.find('[data-role="notification-num"]');
        this._sentListNum = this._sentEl.find('[data-role="list-num"]');
        this._sentNotEl = this._receivedEl.find('[data-role="notification-num"]');

        this._receivedCurPage = this._sentCurPage = 0;
    },

    _messageBalloon: function(e) {
        var targetEl = $$(e.currentTarget);
        var exhibitionId = targetEl.data('val');
        var messages;

        if (targetEl.data('cat') === 'received') {
            messages = this._getReceiveMessages(exhibitionId, this._receiveList, 'fromUser');
        } else {
            messages = this._getReceiveMessages(exhibitionId, this._sentList, 'receiver');
        }

        messages && messages.length && $.each(messages, function(index, item) {
            item.date = moment(item.gmtCreate).fromNow();
            item.message = item.content;
        });

        if (this._balloonIns) {
            this._balloonIns.element.remove();
        }

        this._balloonIns = new MessageBalloon({
            messages: messages,
            width: 400,
            trigger: targetEl,
            triggerType: 'click',
            arrowPosition: 'tr',
            inViewport: false,
            hasCloseX: true
        }).show();
    },

    _getReceiveMessages: function(exhibitionId, list, prop) {
        var messages;

        $.each(list.items || [], function(index, item) {
            if (item[prop].id == exhibitionId) {
                messages = item.messages;

                // 跳出循环
                return false;
            }
        });

        return messages;
    },

    _connect: function(e) {
        var targetEl = $$(e.currentTarget);
        var userId = targetEl.data('val');

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
                parEl.html('<span class="eh-connected-status">Connected</span>');
            } else {
                parEl.html('<a data-role="connect-button" data-val="' + userId + '" class="ui2-button ui2-button-default ui2-button-primary ui2-button-medium">connect</a>');
            }

        });
    },

    _viewMoreList: function(e) {
        var targetEl = $$(e.currentTarget);

        if (targetEl.closest('[data-role="received"]').length) {
            this.set('receivedCurPage', ++this._receivedCurPage);
        } else {
            this.set('sentCurPage', ++this._sentCurPage);
        }
    },

    _exhibitionSelect: function(e) {
        var targetEl = $$(e.currentTarget);

        if (targetEl.hasClass('active')) {
            return;
        }

        this._receivedCurPage = this._sentCurPage = 1;

        $$('[data-role="slide-item"]').removeClass('active');

        var exhibitionId = targetEl.data('id');
        var data = {};

        $.each(this._exhibitionData.items, function(index, item) {
            if (Number(item.id) === Number(exhibitionId)) {
                data = item;

                return false;
            }
        });

        targetEl.addClass('active');

        this.trigger('exhibitionSelected', this._curExhData = data);
    },

    _initOverlay: function() {
        this._overlay = new Overlay({
            template: selectTpl,
            trigger: this._selectEl
        });

        this._overlayEl = this._overlay.element;

        this._overlayReceivedEl = this._overlayEl.find('[data-id="1"]');
        this._overlaySentEl = this._overlayEl.find('[data-id="2"]');
        this._selectTextEl = $$('[data-role="selected-text"]');


        this._overlay.on('selected', function(selectedEl) {
            if (selectedEl.data('id') == 1) {
                this._overlayReceivedEl.addClass('active');
                this._overlaySentEl.removeClass('active');

                this._receivedEl.show();
                this._sentEl.hide();

                this._receivedNotEl.html(this._receivedListNum.text() == 1 ? ' Pending Notification' : ' Pending Notifications');
            } else {
                this._overlayReceivedEl.removeClass('active');
                this._overlaySentEl.addClass('active');

                this._sentEl.show();
                this._receivedEl.hide();

                if (this._sentCurPage === 0) {
                    this._getSentInformList(true);
                }

                this._sentNotEl.html(this._sentListNum.text() == 1 ? ' Sent Notification' : ' Sent Notifications');
            }

            this._selectTextEl.text(selectedEl.text());
        }.bind(this));
    },

    _initSlide: function() {
        var slide = new Slide({
            element: '[data-role="slide-container"]',
            fragmentNum: 4
        });
    },

    _initExhibitionList: function() {
        var loadingPanel = this._headerPanel;

        loadingPanel.show();

        this.send({
            url: this.get('exhibitionListUrl'),
            type: "GET"
        }).then(function(returnData) {
            this._exhibitionData = returnData = returnData.data;
            this._transDate(returnData.items || []);

            loadingPanel.hide();

            if (returnData.items && returnData.items.length) {
                this._moveEl.html(handlebars.compile(exhibitionHeaderTpl)(returnData));

                this._initSlide();

                this.trigger('exhibitionSelected', this._curExhData = returnData.items[0]);
            } else {
                $$('[data-role="has-exhibitions"]').remove();
                $$('[data-role="no-exhibitions"]').show();
            }


        }.bind(this));
    },

    _selectedAnExhibition: function(data) {
        // 渲染展会详细
        this._exhibitionDetailEl.html(handlebars.compile(exhibitionDetailTpl)(data));
    },

    _initPanels: function() {
        this._headerPanel = new LoadingPanel({
            trigger: '[data-role="slide-outer"]',
            i18n: loadingPanelI18n
        });

        this._receivedPanel = new LoadingPanel({
            trigger: this._receivedListEl,
            i18n: loadingPanelI18n
        });

        this._sentPanel = new LoadingPanel({
            trigger: this._sentListEl,
            i18n: loadingPanelI18n
        });
    },

    _subscribeEvents: function() {
        // 订阅选中一个展会后的事件
        this.on('exhibitionSelected', this._selectedAnExhibition.bind(this));
        this.on('exhibitionSelected', this._initListStatus.bind(this));
    },

    // 选中一个展会后的初始化
    _initListStatus: function() {
        this._receivedEl.show();
        this._sentEl.hide();

        // 初始化右侧选择项
        this._overlayReceivedEl.addClass('active');
        this._overlaySentEl.removeClass('active');
        this._selectTextEl.text(this._overlayReceivedEl.text());

        this._receivedCurPage = 0;
        this._sentCurPage = 0;

        // 加载列表
        this._getReceivedInformList(true);
    },

    _getReceivedInformList: function(isFirstRender) {
        // 加载中提示
        this._receivedPanel.show();

        this._receivedCurPage = this._receivedCurPage || 1;

        if (isFirstRender || this._receivedCurPage === 1) {
            this._receivedListEl.html('');
        }

        this.send({
            url: this.get('receivedListUrl'),
            type: "GET",
            data: {
                curPage: this._receivedCurPage,
                pageSize: this.get('pageSize'),
                exhibitionId: this._curExhData.id
            }
        }).then(function(returnData) {
            returnData = this._receiveList = returnData.data;

            console.log(returnData);

            // 显示列表条数
            this._receivedListNum.html(returnData.totalItem);

            this._receivedNotEl.html(returnData.totalItem == 1 ? ' Pending Notification' : ' Pending Notifications');

            if (returnData.totalItem) {
                // 渲染list列表
                this._receivedListEl.append(handlebars.compile(receivedListTpl)(returnData));
            } else {
                // this._receivedListEl.html(listNoResultTpl);
            }

            // 决定底层view more是否显示
            if (returnData.currentPage >= returnData.totalPage) {
                this._receivedFooter.hide();
            } else {
                this._receivedFooter.show();
            }

            // 显示status状态
            this._renderReceivedStatus(returnData);

            $(window).trigger('resize');
        }.bind(this), function() {
            // this._receivedListEl.html(listNoResultTpl);
            this._receivedListNum.html(0);
            this._receivedNotEl.html(' Pending Notification');
        }.bind(this)).always(function() {
            this._receivedPanel.hide();
        }.bind(this));
    },

    _renderReceivedStatus: function(receivedListData) {
        var userIds = this._getIds(receivedListData);

        userIds && this.send({
            url: this.get('statusUrl'),
            data: {
                userIds: userIds
            },
            type: 'GET'
        }).then(function(statusList) {
            console.log(statusList);

            $.each(statusList.data, function(index, item) {
                var statusEl = $$('[data-role="status-area-receive"][data-userid="' + item.userId + '"]');

                statusEl.html(handlebars.compile(receiveStatusTpl)(item));
            }.bind(this));
        }.bind(this));
    },

    _getSentInformList: function(isFirstRender) {
        this._sentPanel.show();

        if (isFirstRender || this._sentCurPage === 1) {
            this._sentListEl.html('');
        }

        this._sentCurPage = this._sentCurPage || 1;

        this.send({
            url: this.get('sentListUrl'),
            type: "GET",
            data: {
                curPage: this._sentCurPage,
                pageSize: this.get('pageSize'),
                exhibitionId: this._curExhData.id
            }
        }).then(function(returnData) {

            returnData = this._sentList = returnData.data;

            console.log(returnData);

            // 显示列表条数
            this._sentListNum.html(returnData.totalItem);
            this._sentNotEl.html(returnData.totalItem == 1 ? ' Sent Notification' : ' Sent Notifications');

            if (returnData.totalItem) {
                // 渲染列表
                this._sentListEl.append(handlebars.compile(sentListTpl)(returnData));
            } else {
                // this._sentListEl.html(listNoResultTpl);
            }


            // 决定底部view more是否显示
            if (returnData.currentPage >= returnData.totalPage) {
                this._sentFooter.hide();
            } else {
                this._sentFooter.show();
            }

            this._renderSentStatus(returnData);
        }.bind(this), function() {
            // this._sentListEl.html(listNoResultTpl);
            this._sentListNum.html(0);
            this._sentNotEl.html(' Sent Notification');
        }.bind(this)).always(function() {
            this._sentPanel.hide();
        }.bind(this));
    },

    _renderSentStatus: function(sentListData) {
        var userIds = this._getIds(sentListData, 'receiver');

        userIds && this.send({
            url: this.get('statusUrl'),
            data: {
                userIds: userIds
            },
            type: 'GET'
        }).then(function(statusList) {
            console.log(statusList);

            $.each(statusList.data, function(index, item) {
                var statusEl = $$('[data-role="status-area-sent"][data-userid="' + item.userId + '"]');

                statusEl.html(handlebars.compile(receiveStatusTpl)(item));
            }.bind(this));
        }.bind(this));
    },

    // *********** helpers ***********
    _transDate: function(items) {
        $.each(items, function(index, item) {
            item.startTime = item.startTime.replace(/\-/g, '.');
            item.endTime = item.endTime.replace(/\-/g, '.');
        });

        return items;
    },

    _getIds: function(returnData, prop) {
        prop = prop || 'fromUser';
        var ary = [];

        $.each(returnData.items, function(index, item) {
            item[prop] && ary.push(item[prop].id);
        });

        return ary.join(',');
    }
});
