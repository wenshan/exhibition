var $ = require('alpha-jquery/jquery');
var Handlebars = require('alpha-handlebars/handlebars');
var MessageTip = require('scc-bp-message-tip/message-tip');
var Widget = require('../../../common/js/widget-backend');
var Dialog = require('alpha-dialog/dialog');
var textarea = require('../../../common/js/textarea');
var Slide = require('../../../common/js/slide.js');
var MessageTip = require('scc-bp-message-tip/message-tip');
var LoadingPanel = require('alpha-loading-panel/loading-panel');
var informTpl = require('./src/inform.tpl');
var informDialogTpl = require('./src/inform-dialog.tpl');


var $$;

//取得名字的第一个字母或汉字
Handlebars.registerHelper('photoLetter', function(name) {
    name = name ? name : ' ';
    return name.charAt(0).toUpperCase();
});
//对于需要显示的特殊编码进行转义
Handlebars.registerHelper('decode', function(str) {
    return _decode(str);
});

function _decode(str) {
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
}

var Inform = Widget.extend({

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._showDialog();
        this._initOptions();

        $$ = this;
    },
    attrs: {
        '_originalData': [],
        '_sentInform': '/dashboard/ajax/inform/send.do',
        '_getExhibationList': '/dashboard/ajax/inform/exhibitionsInformable.do'
    },
    show: function(data) {
        var _self = this;
        this.userId = data.userId;
        this.userPhoto = data.userPhoto;
        this.userName = data.userName;

        this.set('_originalData', []);
        this._dialog.set('content', '');
        this._exhibationId = 0;
        this._getInformData();

        this._dialogWrap?this._dialogWrap.find('[data-role="feeback"]').html(''):null;
    },
    _getInformData: function() {
        this.send({
            url: this.get('_getExhibationList'),
            type: 'GET',
            dataType: 'json',
            data: {
                curPage: this._curPage,
                lang: 'en',
                pageSize: '12'
            },
            onSuccess: function(res) {
                if (res.code == 200) {
                    if (res.data.items.length == 0) {
                        MessageTip.alert('You need to be registered for at least one event before informing someone of your attendance');
                    } else {
                        $$._curPage = res.data.currentPage;
                        $$._totalPage = res.data.totalPage;
                        res.data.userId = $$.userId;
                        res.data.userPhoto = $$.userPhoto;
                        res.data.userName = $$.userName;
                        res.data.items = $$.get('_originalData').concat(res.data.items);
                        $$.set('_originalData', res.data.items);
                        $$._content = Handlebars.compile(informTpl)(res.data);

                        $$._dialog.set('content', $$._content);
                        $$._dialog.show();
                        $$._initElements();
                        $$._initSlideWidth();
                        $$._initTextarea();
                        $$._initSlideButton();
                    }
                }
            }
        });
    },
    _initOptions: function() {
        this._curPage = 1;
        this._totalPage = 1;
        this._slideOffset = 1;
        this._slideWidth = 248;
    },
    _initElements: function() {
        this._dialogWrap = $('.js-inform-dialog');
        this._slideList = $('.js-inform-dialog').find('[data-role="slide-list"]');
        this._slideLength = this._slideList.find('[data-role="slide-item"]').length;
        this._slideAllOffset = Math.ceil(this._slideLength / 2);
        this._exhibationItem = this._slideList.find('[data-role="slide-item"]');
        this._textarea = $('.js-inform-dialog').find('[data-role="eh-inform-textarea"]');
        this._slideButton = $('[data-role="slide-button"]');
    },
    _showDialog: function() {

        var _self = this;
        this._dialog = new Dialog({
            template: informDialogTpl,
            title: 'INFORM<span class="eh-inform-times-tip">Note: Each person can only be notified 3 times per event</span>',
            content: this._content,
            className: 'inform-dialog-wrap js-inform-dialog',
            width: 720,
            events: {
                'click [data-role="slide-item"]': _self._selectItem
            },
            buttons: [{
                'name': 'INFORM',
                'html': '<div class="eh-inform-buttons">Send</div>',
                'action': function() {
                    $$._submitInform();
                }
            }]
        }).render();
    },
    _initSlideWidth: function() {

        this.slide = new Slide({
            list: $$._slideList,
            item: $$._exhibationItem,
            pageSize: 2,
            leftButton: $('[data-role="slide-button"][direction="left"]'),
            rightButton: $('[data-role="slide-button"][direction="right"]'),
            buttonCallback: function() {
                $$._initSlideButton();
            }
        });
    },
    _initTextarea: function() {

        var _contentWord = '';
        this.textarea = new textarea({
            element: '[data-role="eh-inform-textarea"]',
            remainder: '[data-role="remain-word"]',
            doubleLength: true,
            value: "Hi "  + _decode($$.userName) + ",\nI'll be attending this event, let's see if we can meet on-site. "
        }).render();
        this.textarea.on('input', function() {
            if (parseInt(this.get('remainder').html()) >= 0) {
                _contentWord = this.element.val();
            } else {
                this.element.val(_contentWord);
            }
        });
    },
    _selectItem: function(e) {
        var _target = $(e.target);
        _target = (_target.attr('data-role') == 'slide-item') ? _target : _target.parents('[data-role="slide-item"]');
        $$._exhibationItem.removeClass('eh-attending-item-selected');
        $$._exhibationId = _target.attr('exhibationId');
        _target.addClass('eh-attending-item-selected');
    },
    _submitInform: function() {

        if (!$$._exhibationId) {
            $$._informErrorTip('Please select an event');
        } else if ($$._textarea.val() == '') {
            $$._informErrorTip('Message cannot be empty');
        } else {
            $$.send({
                url: this.get('_sentInform'),
                type: 'POST',
                dataType: 'json',
                data: {
                    content: $$._textarea.val(),
                    exhibitionId: $$._exhibationId,
                    toUserId: $$.userId
                },
                onSuccess: function(res) {
                    if (res.code == 200) {
                        $$._dialog.hide();
                        MessageTip.success('Notification was sent successfully.');
                    }
                },
                onFailure: function(res) {
                    $$._informErrorTip(res.errorMsg);
                },
                disableTip: true
            });
        }
    },
    _informErrorTip: function(error) {
        $$._dialogWrap.find('[data-role="feeback"]').html(error);
        setTimeout(function() {
            $$._dialogWrap.find('[data-role="feeback"]').html('');
        }, 4000);
    },
    _initSlideButton: function() {

        $$._slideButton.find('span').removeClass('eh-attending-list-left-btn-icon-disabled eh-attending-list-right-btn-icon-disabled');
        if ($$.slide.allPage == 1 || $$.slide.allPage == 0) {

            $$._slideButton.find('span[direction="left"]').addClass('eh-attending-list-left-btn-icon-disabled');
            $$._slideButton.find('span[direction="right"]').addClass('eh-attending-list-right-btn-icon-disabled');
        } else if ($$.slide.currentPage == 1) {
            $$._slideButton.find('span[direction="left"]').addClass('eh-attending-list-left-btn-icon-disabled');
        } else if ($$.slide.allPage == $$.slide.currentPage) {
            $$._slideButton.find('span[direction="right"]').addClass('eh-attending-list-right-btn-icon-disabled');
        }
    },


});

module.exports = new Inform();
