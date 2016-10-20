var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var Handlebars = require('alpha-handlebars/handlebars');
var textarea = require('../../../common/components/textarea/textarea');
var informTpl = require('./src/informList.tpl');
var messageTpl = require('./src/message-box.tpl');

var infiniteScroll = require('../../../common/components/infinite-scroll/infinite-scroll');
require('../../../common/components/zepto-modals/modals');

Handlebars.registerHelper('photoLetter', function(name) {
    name = name ? name : ' ';
    return name.charAt(0).toUpperCase();
});

Handlebars.registerHelper('decode', function(str) {
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
});



var Inform = Widget.extend({
    element: '#inform-list',
    setup: function() {
        this.element.addClass('popup');
        this._curpage = 1;
        this._totalpage = 1;
        this._initMessageBoxEvents();
    },
    events: {
        'click [data-role="inform-cancel-button"]': '_hideInform',
        'click [data-role="eh-m-one-exhibition-box"]': '_selectEh',
        'click [data-role="inform-next-button"]': '_editMessage'
    },
    _editMessage: function(e) {
        var _target = $(e.target);
        if (_target.hasClass('active')) {
            this._renderMessageBox();
        }
    },
    _selectEh: function(e) {
        var _target = $(e.target);
        _target = _target.attr('data-role') == 'eh-m-one-exhibition-box' ? _target : _target.parents('[data-role="eh-m-one-exhibition-box"]');
        $('[data-role="eh-m-one-exhibition-box"]').removeClass('active');
        $('[data-role="inform-next-button"]').addClass('active');
        this.ehId = _target.attr('ehId');
        _target.addClass('active');
    },
    _hideInform: function() {
        $.closeModal('#inform-list');
    },
    show: function(data) {
        this.headData = data;
        this._renderList(data);
    },
    _renderList: function(data) {

        var _self = this;
        this.send({
            url: '/dashboard/ajax/inform/exhibitionsInformable.do',
            type: 'GET',
            dataType: 'json',
            data: {
                curPage: this._curpage,
                lang: 'en',
                pageSize: 50
            },
            onSuccess: function(res) {
                if (res.code == 200) {
                    res.data.userId = data.userId;
                    res.data.userName = data.userName;
                    res.data.userPhoto = data.userPhoto;
                    if(res.data.items && res.data.items.length != 0)
                    {
                        var _html = Handlebars.compile(informTpl)({ 'data': res.data });
                        $('#inform-list').html(_html);
                        $.popup('#inform-list');
                        _self._initListHeight();
                        setTimeout(function() {
                            $('[data-role="warning-box"]').hide();
                        }, 5000);
                    }
                    else
                    {
                        $.alert('You need to be registered for at least one event before informing someone of your attendance');
                    }
                }
            }
        });
    },
    _initListHeight: function() {
        var _allHeight = $('#inform-list').height();
        var _headHeight = $('#inform-head').height();
        var _buttonHeight = $('[data-role="inform-next-button"]').height();

        var _listHeigh = _allHeight - _headHeight - _buttonHeight;
        $('#eh-list-wrap').height(_listHeigh);
    },
    _renderMessageBox: function() {
        var _self = this;
        var _html = Handlebars.compile(messageTpl)({ 'data': _self.headData });
        $('#inform-message-box').html(_html);
        $.closeModal('#inform-list');
        $.popup('#inform-message-box');
        this._initMessageTextarea();
    },
    _initMessageTextarea: function() {
        var _content = 'Hi ' + this._decode(this.headData.userName) + ' ,\nAs both of us are attending United Nations Permanent Forum on Indigenous Issues, I would like to meet you during this event.';
        new textarea({
            element: $('#inform-message-box').find('textarea'),
            remainder: $('#inform-message-left-word'),
            doubleLength: true,
            value: 'Hi ' + this._decode(this.headData.userName) + ' ,\nAs both of us are attending United Nations Permanent Forum on Indigenous Issues, I would like to meet you during this event.'
        }).render().on('input', function() {
            if (parseInt(this.get('remainder').html()) >= 0) {
                _content = this.element.val();
            } else {
                this.element.val(_content);
            }
        });
    },
    _initMessageBoxEvents: function() {
        var _self = this;
        $('#inform-message-box').on('click', '.js-back-to-edit', function(e) {

            $.closeModal('#inform-message-box');
            $.popup('#inform-list');
        });
        $('#inform-message-box').on('click', '[data-role="inform-send-button"]', function() {
            var _content = $('[data-role="message-textarea"]').val();
            if (_content) {
                _self.send({
                    url: '/dashboard/ajax/inform/send.do',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        content: _content,
                        exhibitionId: _self.ehId,
                        toUserId: _self.headData.userId
                    },
                    onSuccess: function(res) {
                        if (res.code == 200) {
                            $.closeModal('#inform-message-box');
                            $.alert('Notification was sent successfully.');
                        }
                    }
                });
            }
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

});



module.exports = new Inform;
