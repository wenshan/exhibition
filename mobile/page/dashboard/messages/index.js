var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var handlebars = require('scc-bp-handlebars/handlebars');
var scrollTrigger = require('alpha-scroll-trigger/scroll-trigger');
var moment = require('alpha-moment/moment');

require('../../../common/components/zepto-modals/modals');
var infiniteScroll = require('../../../common/components/infinite-scroll/infinite-scroll');

var listTpl = require('./src/exhibition-list.tpl');
var receivedTpl = require('./src/received.tpl');
var sentTpl = require('./src/sent.tpl');
var popupTpl = require('./src/popup.tpl');

var receivedListTPl = require('./src/received-popup.tpl');
var sentListTPl = require('./src/sent-popup.tpl');

var statusTpl = require('./src/status.tpl');

var noResultReceivedTpl = require('./src/no-result-received.tpl');
var noResultSentTpl = require('./src/no-result-sent.tpl');

handlebars.registerHelper('showDate', function(date) {
    return date.replace(/\-/g, '.');
});

handlebars.registerHelper('showNum', function(num) {
    return num > 99 ? '99+' : num;
});

handlebars.registerHelper('showName', function(user) {
    return (user.userName && user.photo) ? '' : (user.userName || '').charAt(0).toUpperCase();
});

handlebars.registerHelper('showDateFromNow', function(date) {
    return moment(date).fromNow();
});

handlebars.registerHelper('showMessageContent', function(content) {
    return new handlebars.SafeString(content.replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/\r|\n|\r\n/g, '<br>'));
});

handlebars.registerHelper('showSafeString', function(str) {
    str = str || '';

    return new handlebars.SafeString(str.replace(/</g, "&lt;")
        .replace(/>/g, "&gt;"));
});

module.exports = Widget.extend({
    Implements: [infiniteScroll],

    attrs: {
        exhibitionListUrl: '/dashboard/ajax/inform/exhibitionsInvolved.do',
        receivedListUrl: '/dashboard/ajax/inform/messagesReceived.do',
        sentListUrl: '/dashboard/ajax/inform/messagesSent.do',

        statusUrl: '/dashboard/ajax/connect/connectUserList.do',

        statusUpdateUrl: '/dashboard/ajax/connect/updateStatus.do',
        connectUrl: '/dashboard/ajax/connect/addConnect.do',

        listPhotoNum: 4,

        listInfoNum: 20,

        receivedCurPage: 1,

        sentCurPage: 1
    },

    events: {
        'click [data-role="info-item"]': '_popup'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initElements();

        this._getExhibitionList();
        this.initGoTop();
    },
    _initElements: function() {

    },

    _connect: function(e) {
        var targetEl = $(e.currentTarget);
        var userId = targetEl.attr('data-val');

        this.send({
            url: this.get('connectUrl'),
            data: {
                userId: userId
            }
        }).then(function(returnData) {
            targetEl.parent().html('<div class="eh-waiting-status">Waiting for response</div>');
        });
    },

    _checkMessages: function(e) {
        var targetEl = $(e.currentTarget);
        var messagesEl = targetEl.parent().find('[data-role="messages-list"]');

        messagesEl.is(':visible') ? messagesEl.fadeOut() : messagesEl.fadeIn();
    },

    _popup: function(e) {
        var targetEl = $(e.currentTarget);
        var val = targetEl.attr('data-val');
        var eId = targetEl.attr('data-id');

        this.popupEl = $('[data-role="popup"]');

        // 查看消息事件添加
        this.popupEl.html(popupTpl).off('click').on('click', '[data-role="message-check"]', this._checkMessages.bind(this));

        this._popupListEl = $('[data-role="popup-list"]');
        this._popupTitleEl = $('[data-role="eh-select"]');

        $.popup('[data-role="popup"]');

        setTimeout(function() {
            if (val === 'received') {
                this.set('receivedCurPage', 1);
                this._loadReceivedPop(eId);
            } else {
                this.set('sentCurPage', 1);
                this._loadSentPop(eId);
            }

            $('[data-role="return"]').off('click').on('click', function() {
                $.closeModal('[data-role="popup"]');
            });

            $('[data-role="actions"]').off('click').on('click', function() {
                var buttons1 = [{
                    text: 'select please',
                    label: true
                }, {
                    text: 'Received Inform',
                    onClick: function() {
                        this._curCat = 'received';

                        this._popupListEl.find('[data-role="pop-info-item"]').remove();
                        this._popupListEl.find('[data-role="list-loading-helper"]').show();
                        this.set('receivedCurPage', 1);
                        this._loadReceivedPop();

                        this._removeScroll(true);
                        this._addPopupScroll();
                    }.bind(this)
                }, {
                    text: 'Sent Inform',
                    onClick: function() {
                        this._curCat = 'sent';

                        this._popupListEl.find('[data-role="pop-info-item"]').remove();
                        this._popupListEl.find('[data-role="list-loading-helper"]').show();
                        this.set('sentCurPage', 1);
                        this._loadSentPop();

                        this._removeScroll(true);
                        this._addPopupScroll();
                    }.bind(this)
                }];

                var buttons2 = [{
                    text: 'cancel',
                    bg: 'danger'
                }];

                $.actions([buttons1, buttons2]);
            }.bind(this));

            this._addPopupScroll();
        }.bind(this), 300);
    },

    _addPopupScroll: function() {
        this._popupScrollEl = this._popupScrollEl || $('[data-role="popup"]');
        this._subScrollEl = this._subScrollEl || $('[data-role="eh-popup"]');

        var loadFunc = this._curCat === 'received' ? this._loadReceivedPop : this._loadSentPop;

        this.addScroll(loadFunc, this._popupScrollEl, this._subScrollEl);
    },

    // 展会列表获取
    _getExhibitionList: function() {
        var listEl = $('[data-role="exhibition-list"]');

        this.send({
            url: this.get('exhibitionListUrl'),
            type: "GET"
        }).then(function(returnData) {
            var me = this;

            console.log('展会列表：', returnData);

            returnData = returnData.data;

            listEl.find('[data-role="list-loading-helper"]').remove();

            if (returnData.items && returnData.items.length) {
                listEl.html(handlebars.compile(listTpl)(returnData));

                scrollTrigger.add({
                    element: '[data-role="exhibition"]',
                    distance: 0,
                    onRouse: function(args) {
                        // 加载邀请列表
                        me._loadInformList(this.find('[data-role="exhibition-list"]'));
                    },
                    oneoff: true
                });
            } else {
                $('[data-role="no-content-show"]').show();
            }
        }.bind(this));
    },

    _loadInformList: function(el) {
        var val = el.data('val');

        this.send({
            url: this.get('receivedListUrl'),
            type: "GET",
            data: {
                curPage: 1,
                pageSize: this.get('listPhotoNum'),
                exhibitionId: val
            }
        }).then(function(returnData) {
            returnData = returnData.data;

            el.find('[data-role="list-loading-helper"]').remove();

            if (returnData.items && returnData.items.length) {
                returnData.eId = val;
                el.append(handlebars.compile(receivedTpl)(returnData));
            }
        }.bind(this)).always(function() {
            // 加载发出列表
            this._loadSentList(el);
        }.bind(this));
    },

    _loadSentList: function(el) {
        var val = el.data('val');

        this.send({
            url: this.get('sentListUrl'),
            type: "GET",
            data: {
                curPage: 1,
                pageSize: this.get('listPhotoNum'),
                exhibitionId: val
            }
        }).then(function(returnData) {
            returnData = returnData.data;

            el.find('[data-role="list-loading-helper"]').remove();

            if (returnData.items && returnData.items.length) {
                returnData.eId = val;
                el.append(handlebars.compile(sentTpl)(returnData));
            }
        }.bind(this));
    },

    _loadReceivedPop: function(id) {
        id ? (this._curExhibitionId = id) : (id = this._curExhibitionId);
        this._curCat = 'received';

        this.loadedAll = false;
        var curPage = this.get('receivedCurPage');

        return this.send({
            url: this.get('receivedListUrl'),
            type: "GET",
            data: {
                curPage: curPage,
                pageSize: this.get('listInfoNum'),
                exhibitionId: id
            }
        }).then(function(returnData) {
            returnData = returnData.data;

            if (returnData.currentPage >= returnData.totalPage) {
                this.loadedAll = true;
            }

            this.set('receivedCurPage', ++curPage);

            this._popupListEl.find('[data-role="list-loading-helper"]').hide();
            this._popupTitleEl.html('Received Inform (' + returnData.totalItem + ')');

            if (returnData.items && returnData.items.length) {
                this._popupListEl.find('[data-role="empty"]').remove();
                this._popupListEl.append(handlebars.compile(receivedListTPl)(returnData));
            } else {
                this._popupListEl.html(noResultReceivedTpl);
            }


            this._renderStatus(returnData);
        }.bind(this));
    },

    _renderStatus: function(receivedListData, prop) {
        var userIds = this._getIds(receivedListData, prop);

        userIds && this.send({
            url: this.get('statusUrl'),
            data: {
                userIds: userIds
            },
            type: 'GET'
        }).then(function(statusList) {
            console.log(statusList);

            $.each(statusList.data, function(index, item) {
                var statusEl = $('[data-role="popup-operation"][data-id="' + item.userId + '"]');

                statusEl.html(handlebars.compile(statusTpl)(item));
            }.bind(this));

            this.popupEl.on('click', '[data-role="connect-button"]', this._connect.bind(this));

            this.popupEl.on('click', '[data-role="status-update"]', this._statusUpdate.bind(this));
        }.bind(this));
    },

    _statusUpdate: function(e) {
        var targetEl = $(e.currentTarget);
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
                parEl.html('<div class="eh-connected-status">Connected</div>');
            } else {
                parEl.html('<a data-val="' + userId + '" data-role="connect-button" class="eh-button-full">Connect</a>');
            }

        });
    },

    _loadSentPop: function(id) {
        id ? (this._curExhibitionId = id) : (id = this._curExhibitionId);
        this._curCat = 'sent';

        this.loadedAll = false;

        var curPage = this.get('sentCurPage');

        return this.send({
            url: this.get('sentListUrl'),
            type: "GET",
            data: {
                curPage: curPage,
                pageSize: this.get('listInfoNum'),
                exhibitionId: id
            }
        }).then(function(returnData) {
            returnData = returnData.data;

            if (returnData.currentPage >= returnData.totalPage) {
                this.loadedAll = true;
            }

            this.set('sentCurPage', ++curPage);

            this._popupListEl.find('[data-role="list-loading-helper"]').hide();

            this._popupTitleEl.html('Sent Inform (' + returnData.totalItem + ')');

            if (returnData.items && returnData.items.length) {
                this._popupListEl.find('[data-role="empty"]').remove();
                this._popupListEl.append(handlebars.compile(sentListTPl)(returnData));
            } else {
                this._popupListEl.html(noResultSentTpl);
            }

            this._renderStatus(returnData, 'receiver');
        }.bind(this));
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
