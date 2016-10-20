var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var Handlebars = require('alpha-handlebars/handlebars');
var textarea = require('../../../common/components/textarea/textarea');
var pendingListTpl = require('./src/pedding-list.tpl');
var connectedListTPl = require('./src/connected-list.tpl');
var remarkTpl = require('./src/remark.tpl');

var infiniteScroll = require('../../../common/components/infinite-scroll/infinite-scroll');

require('../../../common/components/zepto-modals/modals');
//取得名字的第一个字母或汉字
Handlebars.registerHelper('photoLetter', function(name) {
    return name.charAt(0).toUpperCase();
});

Handlebars.registerHelper('showMainProduct', function(arr) {
    return arr.join(' / ');
});


var noPendingDataHtml = '<div class="eh-nopedding-box" id="eh-nopending-box"><span class="eh-nopedding-icon"></span>You have no pending requests</div>';
var noConnectedDataHtml = '<div class="eh-noconection-box id="eh-nocontact-box"><span class="eh-noconection-icon"></span>Your connections list is empty</div>';

var $$;

var Cm = Widget.extend({
    Implements: [infiniteScroll],
    setup: function() {
        var _self = this;
        this.constructor.superclass.setup.call(this);
        this._initElements();
        this._getPendingListData();

        $$ = this;
        this._initScroll();
        this.initGoTop();
    },
    events: {
        'click .js-switch-list-btn': '_switchList',
        'click [data-role="show-more-info"]': '_showMoreInfo',
        'click [data-role="pending-btn"]': '_opratePending',
        'click [data-role="ramark-button"]': '_editRemark',
        'click [data-role="inform-button"]': '_showInform',
        'click [data-role="company-name"]': '_turnToCompanyInfo'
    },
    _initScroll: function() {
        var _self = this;
        this.scrollStatus = false;
        var _timer = null;
        this.element.bind('touchmove', function() {
            var allH = $('body').height();
            var scrollTop = $('body').scrollTop();
            var windowH = $(window).height();

            if (allH - scrollTop - windowH <= 50) {
                _self.scrollStatus = true;
                _self._scollFn();
                $('[data-role="list-loading-helper"]').show();
                clearTimeout(_timer);
                _timer = setTimeout(function() {
                    $('[data-role="list-loading-helper"]').hide();
                }, 2000);
            }
        });
    },
    _turnToCompanyInfo: function(e) {
        var _target = $(e.target);
        var _companyId = _target.attr('companyId');

        window.open("/company.htm?id=" + _companyId);
    },
    _editRemark: function(e) {
        var _self = this;
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-man"]');

        this.userId = _parent.attr('userId');
        this.currentComment = _parent.find('[data-role="user-comment"]');
        this._originalNote = this.currentComment.html();

        $.modal({
            afterText: Handlebars.compile(remarkTpl)(),
            extraClass: 'remark-modal'
        });
        setTimeout(function() {
            _self._initTextarea();
            _self._initRemarkEvent();
            _self.textarea.set('value', _self._decode(_self._originalNote));
            //$('#remark-box').find('textarea').trigger('focus');
        }, 1);
    },
    _submitRemark: function() {
        var _self = this;
        var _note = $('#remark-box').find('textarea').val();
        _note = $.trim(_note);

        if (_note == this._originalNote) {
            $.closeModal();
        } else {
            this.send({
                url: '/dashboard/ajax/connect/updateComment.do',
                type: 'POST',
                dataType: 'json',
                data: {
                    userId: this.userId,
                    comment: _note
                },
                onSuccess: function(res) {
                    if (res.code == 200) {
                        var _html = Handlebars.compile('{{content}}')({ 'content': _note });
                        _self.currentComment.html(_html);
                        $.closeModal();
                    }
                },
                onFailure: function(r) {
                    $.closeModal();
                }
            });
        }
    },
    _opratePending: function(e) {
        var _self = this;
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-man"]');
        var _oprateBox = _target.parents('.man-down');

        this.action = '';

        if (_target.hasClass('accept-button')) {
            this.action = 'accept';
        } else {
            this.action = 'ignore';
        }

        var data = {
            opt: this.action,
            userId: _parent.attr('userId')
        };

        this.send({
            url: '/dashboard/ajax/connect/updateStatus.do',
            type: 'POST',
            dataType: 'json',
            data: data,
            onSuccess: function(res) {
                if (res.code == 200) {
                    if (_self.action == 'accept') {
                        $.alert('Request Accepted <br/>Note: Reload the page to see in My Connections');
                        _oprateBox.html('Connected');
                    } else if (_self.action == 'ignore') {
                        _oprateBox.html('Ignored');
                    }
                }
            }
        });
    },
    _showMoreInfo: function(e) {
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-man"]');

        this._detailInfo.hide();
        _parent.find('[data-role="show-detail"]').show();
    },
    _switchList: function(e) {
        var _target = $(e.target);
        this._pendingCurpage = 1;
        this._connectCurpage = 1;
        this._pendingTotalPage = 1;
        this._connectTotalPage = 1;

        if (!this._ajax) {
            this.connectList.html('');
            this._switchListBtn.removeClass('active');
            _target.addClass('active');
            if (_target.attr('data-role') == 'my-contact') {
                this.listType = 'connected';
                this._getConnectedListData();
            } else {
                this.listType = 'pending';
                this._getPendingListData();
                _target.find('[data-role="new-point"]').remove();
            }
        }
    },
    _renderPendingList: function(data) {
        var _html = Handlebars.compile(pendingListTpl)({ 'data': data });
        var _self = this;
        this.connectList.append(_html);
    },
    _renderConnectedList: function(data) {
        var _html = Handlebars.compile(connectedListTPl)({ 'data': data });
        var _self = this;
        this.connectList.append(_html);
    },
    _getPendingListData: function() {
        var _self = this;
        if (this._ajax) {
            $('[data-role="list-loading-helper"]').hide();
            return false;
        }
        this._ajax = true;
        return this.send({
            url: '/dashboard/ajax/connect/myList.do',
            type: 'POST',
            dataType: 'json',
            data: {
                curPage: this._pendingCurpage,
                pageSize: 10,
                scope: 2,
                status: 'Pending'
            },
            onSuccess: function(res) {
                if (res.code == 200) {
                    if ((!res.data.items || res.data.items.length == 0) && !_self.initOnce) {
                        _self.initOnce = true;
                        $('.js-switch-list-btn[data-role="pending"]').find('[data-role="new-point"]').remove();
                        _self._switchListBtn.removeClass('active');
                        $('.js-switch-list-btn[data-role="my-contact"]').addClass('active');
                        _self.listType = 'connected';
                        _self._ajax = false;
                        _self._getConnectedListData();
                    } else if (!res.data.items || res.data.items.length == 0) {
                        _self.connectList.html(noPendingDataHtml)
                    } else {
                        $('.js-switch-list-btn[data-role="pending"]').find('[data-role="new-point"]').css({ 'display': 'inline-block' });
                    }
                    if (_self._pendingCurpage <= _self._pendingTotalPage) {
                        _self._pendingTotalPage = res.data.totalPage;
                        _self._renderPendingList(res.data);
                        _self._pendingCurpage++;
                    }
                }
                setTimeout(function() {
                    _self._ajax = false;
                }, 10);
                $('[data-role="list-loading-helper"]').hide();
            }
        });
    },
    _getConnectedListData: function() {
        var _self = this;
        if (this._ajax) {
            $('[data-role="list-loading-helper"]').hide();
            return false;
        }
        this._ajax = true;
        return this.send({
            url: '/dashboard/ajax/connect/myList.do',
            type: 'POST',
            dataType: 'json',
            data: {
                curPage: this._connectCurpage,
                pageSize: 10,
                scope: 0,
                status: 'Success'
            },
            onSuccess: function(res) {
                if (res.code == 200) {
                    // $('#my-connected-count').html(res.data.totalItem);
                    if (!res.data.items || res.data.items.length == 0) {
                        //$('#eh-search-404').show();
                        _self.connectList.html(noConnectedDataHtml);
                        //_self.connectList.hide();
                    }
                    if (_self._connectCurpage <= _self._connectTotalPage) {
                        _self._renderConnectedList(res.data);
                        _self._connectCurpage++;
                        _self._connectTotalPage = res.data.totalPage;
                        _self._detailInfo = $('[data-role="show-detail"]');
                    }
                }
                setTimeout(function() {
                    _self._ajax = false;
                }, 10);
                $('[data-role="list-loading-helper"]').hide();
            }
        });
    },
    _initElements: function() {
        this.connectList = $('#connectList');
        this._switchListBtn = $('.js-switch-list-btn');
        this._moreInfo = $('.man-more-info');
        this._connectCurpage = 1;
        this._pendingCurpage = 1;
        this._pendingTotalPage = 1;
        this._connectTotalPage = 1;
        this._ajax = false;

        this._informList = require('../inform/index.js');

        this.listType = 'pending';
    },
    _addScoll: function() {
        var _self = this;
        this.addScroll(_self._scollFn, this.element);
    },
    _scollFn: function() {
        if (this.listType == 'connected') {
            return this._getConnectedListData();
        } else {
            return this._getPendingListData();
        }
    },
    _initTextarea: function() {
        var _content = '';
        this.textarea = new textarea({
            element: $('#remark-box').find('textarea'),
            remainder: $('#left-word'),
            doubleLength: true
        }).render().on('input', function() {
            if (parseInt(this.get('remainder').html()) >= 0) {
                _content = this.element.val();
            } else {
                this.element.val(_content);
            }
        });
    },
    _initRemarkEvent: function() {
        var _self = this;
        $('#remark-box').on('click', '[data-role="cancel-btn"]', function() {
            $.closeModal();
        });
        $('#remark-box').on('click', '[data-role="submit-btn"]', function() {
            _self._submitRemark();
        });
    },
    _decode: function(str) {
        var s = "";
        if (str.length == 0) {
            return "";
        }
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        s = s.replace(/<br>/g, "\n");
        return s;
    },

    _showInform: function(e) {
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-man"]');
        var userId = _parent.attr('userId');
        var userName = _parent.find('[data-role="user-name"]').html();
        var userPhoto = _parent.find('[data-role="user-photo"]').find('img').attr('src');

        this._informList.show({
            userId: userId,
            userName: userName,
            userPhoto: userPhoto
        });
    }
});

module.exports = Cm;
