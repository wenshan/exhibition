var $ = require('alpha-jquery/jquery');
var PaginationComplex = require('alpha-pagination/pagination-complex');
var Handlebars = require('alpha-handlebars/handlebars');
var textarea = require('../../../common/js/textarea');
var balloon = require('alpha-balloon/balloon');
var LoadingPanel = require('alpha-loading-panel/loading-panel');
var MessageTip = require('scc-bp-message-tip/message-tip');

var Widget = require('../../../common/js/widget-backend');
var _pendingItemTpl = require('./src/pending-item.tpl');
var _concactManItemTpl = require('./src/concact-man-item.tpl');

var Slide = require('../../../common/js/slide.js');


//条件判断
Handlebars.registerHelper('equal', function(content, value, options) {
    if (content == value) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//转换大写方法
Handlebars.registerHelper('toLowerCase', function(content) {
    return content.toLowerCase();
});
//取得名字的第一个字母或汉字
Handlebars.registerHelper('photoLetter', function(name) {
    return name.charAt(0).toUpperCase();
});
//展示状态的方法
Handlebars.registerHelper('showStatus', function(status) {
    if (status == 'Pending' || status == 'Reject') {
        return 'Waiting';
    } else if (status == 'Success') {
        return 'Connected';
    }
});
Handlebars.registerHelper('console', function(content) {
    console.log(content);
});
//展示主营业务方法
//有两种状态，第一种type == 0 的时候，展示一个业务，第二种type == 1的时候将所有业务用 & 符号连接返回
Handlebars.registerHelper('showMainProduct', function(list, type) {
    if (type == 0) {
        if (list.length == 1) {
            return list[0];
        } else if (list.length == 0) {
            return '';
        } else {
            return list[0] + '...';
        }

    } else if (type == 1) {
        return list.join('/');
    }
});

var Index = Widget.extend({
    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initElement();
        this._getPendingListData();
        this._initContactListData();

    },
    //以下事件依次是，pending滑动，编辑备注信息，提交备注信息，退出编辑框，切换pending状态，操作邀请
    events: {
        'click .js-eh-edit-remarks': '_editConcactNotes',
        'click .js-btn-submit-notes': '_submitNotes',
        'click .js-btn-cancel-edit': '_cancelEdit',
        'click #eh-change-recieve-sent li': '_changeReceiveSent',
        'click .js-oprate-pending': '_opratePending',
        'click [data-role="eh-custm-inform-btn"]': '_informDialog',
        'click [data-role="connect-company-name"]': '_turnToCompanyInfo'
    },
    //listUrl ，获取联系人列表及发送的邀请和接收到的邀请的列表
    attrs: {
        pendingListUrl: '/dashboard/ajax/connect/mySimpleList.do',
        contactListUrl: '/dashboard/ajax/connect/myList.do',
        addRemarksUrl: '/dashboard/ajax/connect/updateComment.do',
        opratePendingUrl: '/dashboard/ajax/connect/updateStatus.do'
    },
    //初始化textarea 组件
    _initTextarea: function() {
        var _self = this;
        var _content = '';

        this._concactList.find('[data-role="edit-notes-box"]').find('textarea').each(function(index) {

            var _that = this;

            new textarea({
                element: _that,
                remainder: $(_that).parents('[data-role="one-concact"]').find('.remained-word'),
                doubleLength: true
            }).render().on('input', function() {
                if (parseInt(this.get('remainder').html()) >= 0) {
                    _content = this.element.val();
                } else {
                    this.element.val(_content);
                }
            });
        });
    },
    //初始化pending application列表
    _getPendingListData: function(opt) {
        var _self = this;

        this._pendingLoading = new LoadingPanel({
            trigger: '#eh-pedding-people-list-wrap'
        }).render();

        this._pendingLoading.show();

        this._getManListData({
            url: this.get('pendingListUrl'),
            type: 'pending-list',
            curPage: this._pendingCurPage,
            pageSize: 12,
            scope: this._pendingScope,
            status: this._pendingStatus,
            callback: function() {

                if (!_self.slideonce) {
                    _self._initSlideList();
                    _self.slideonce = true;
                }

                _self._pendingList.width('100%');
                _self._pendingList.find('li').width('33%');

                _self.slide.set('item', _self._pendingList.find('li'));
                _self.slide._initStyle();
                _self._pendingLoading.hide();
                _self._initSlideButton();
            }
        });
    },
    //初始化my contact 联系人列表
    _initContactListData: function() {
        var _self = this;
        this._concactLoading = new LoadingPanel({
            trigger: _self._concactList
        });
        this._concactLoading.show();
        this._getManListData({
            url: this.get('contactListUrl'),
            type: 'contact-list',
            curPage: this._concactcurPage,
            pageSize: 4,
            scope: 0,
            status: 'Success',
            callback: function() {
                _self._initTextarea();
                _self._initPagination(arguments[0]);
                _self._concactLoading.hide();
            }
        });
    },
    //获取联系人列表和pending application 列表数据
    _getManListData: function(data) {
        var _self = this;
        var type = data.type;

        var postData = {
            curPage: data.curPage || 1,
            pageSize: data.pageSize || 10,
            scope: data.scope,
            status: data.status
        };

        this.send({
            url: data.url,
            type: 'POST',
            data: postData,
            dataType: 'json',
            onSuccess: function(res) {
                if (res.code == 200) {
                    if (type == 'pending-list') {
                        if (!res.data.items || res.data.items.length == 0) {
                            _self._pendingList.hide();
                            _self._nopendingBox.show();
                        } else {
                            _self._pendingList.show();
                            _self._nopendingBox.hide();
                            _self._pendingCount.html('(' + res.data.totalItem + ')');
                            _self._pendingTotal = res.data.totalPage;
                            if (data.scope == 1) {
                                res.data.isReceive = false;
                            } else if (data.scope == 2) {
                                res.data.isReceive = true;
                            }
                            _self._renderPendingList(res.data);
                        }
                    } else if (type == 'contact-list') {
                        if (!res.data.items || res.data.items.length == 0) {
                            _self._concactList.hide();
                            _self._nocontactBox.show();
                        } else {
                            _self._concactList.show();
                            _self._nocontactBox.hide();
                            _self._contactCount.html('(' + res.data.totalItem + ')');
                            _self._renderConcactList(res.data);
                        }
                    }
                    if (data.callback && typeof data.callback == 'function') {
                        data.callback.apply(_self, [res.data]);
                    }
                }
            }
        });
    },
    //操作pending application 列表
    _opratePending: function(e) {
        var _self = this;
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-request-box"]');
        var _action = (_target.attr('data-role') == 'accept-contact') ? 'Connected' : 'Ignored';

        var data = {
            opt: (_action == 'Connected') ? 'accept' : 'ignore',
            userId: _parent.attr('userId')
        };
        _parent.find('[data-role="oprate-box"]').html(_action);
        this._itemLength = $('#eh-pedding-people-list li').length;
        this._allPendingOffset = Math.ceil(_self._itemLength / 3);

        if (this._itemLength == 0) {
            _self._pendingList.hide();
            _self._nopendingBox.show();
        }

        this.send({
            url: this.get('opratePendingUrl'),
            type: 'POST',
            data: data,
            dataType: 'json',
            onSuccess: function(res) {
                if (res.code == 200 && _action == 'Connected') {
                    MessageTip.success('Request Accepted <br/>Note: Reload the page to see in My Connections');
                }
            }
        });
    },
    //退出编辑框
    _cancelEdit: function(e) {
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-concact"]');
        var _showBox = _parent.find('[data-role="show-notes-box"]');
        var _editBox = _parent.find('[data-role="edit-notes-box"]');

        _showBox.show();
        _editBox.hide();
    },
    //切换pending application 列表
    _changeReceiveSent: function(e) {
        var _self = this;
        var _target = $(e.target);
        var _parent = $('#eh-change-recieve-sent');
        var _type = _target.attr('type');
        this._pendingScope = 2;
        this._pendingStatus = 'Pending';
        this._pendingCurPage = 1;
        this.offset = 1;

        if (_target.hasClass('eh-peddig-toggle-choosed')) {
            return false;
        }

        if (_type == 'sent') {
            this._pendingScope = 1;
            this._pendingStatus = '';
        }
        this._pendingList.html('');
        this._pendingList.css({'left': 0});
        _parent.find('li').removeClass('eh-peddig-toggle-choosed');
        _target.addClass('eh-peddig-toggle-choosed');
        _parent.prepend(_target);

        this._getPendingListData();
    },
    //提交备注信息
    _submitNotes: function(e) {
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-concact"]');
        var _showBox = _parent.find('[data-role="show-notes-box"]');
        var _editBox = _parent.find('[data-role="edit-notes-box"]');

        var _notes = $.trim(_editBox.find('textarea').val());
        var _cacheNotes = Handlebars.compile('{{text}}')({ 'text': _notes });

        var data = {
            userId: _parent.attr('userId'),
            comment: _notes
        };

        if(_notes == this._notes) {
            _editBox.hide();
            _showBox.show();
            _showBox.find('.js-no-notes-box').hide();
            _showBox.find('.js-has-notes-box').show().find('[data-role="concact-notes"]').html(_cacheNotes);
        } else {
            _showBox.show();
            _editBox.hide();
            if(_notes)
            {
                _showBox.find('.js-no-notes-box').hide();
                _showBox.find('.js-has-notes-box').show().find('[data-role="concact-notes"]').html(_cacheNotes);
            }
            else
            {
                _showBox.find('.js-no-notes-box').show();
                _showBox.find('.js-has-notes-box').hide().find('[data-role="concact-notes"]').html('');
            }

            this.send({
                url: this.get('addRemarksUrl'),
                type: 'POST',
                data: data,
                dataType: 'json',
                onSuccess: function(res) {
                    if (res.code == 200) {
                        MessageTip.success('Submitted Successfully ');
                    } else {
                        MessageTip.error(res.errorMsg);
                    }
                }
            });
        }

    },
    //显示编辑备注信息输入框
    _editConcactNotes: function(e) {
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-concact"]');
        var _showBox = _parent.find('[data-role="show-notes-box"]');
        var _editBox = _parent.find('[data-role="edit-notes-box"]');
        var _notes = '';

        //点击一个编辑框就隐藏掉其他所有的编辑框
        this._concactList.find('[data-role="show-notes-box"]').show();
        this._concactList.find('[data-role="edit-notes-box"]').hide();

        if (_parent.find('[data-role="concact-notes"]').html()) {
            _notes = _parent.find('[data-role="concact-notes"]').html();
            _notes = this._decode(_notes);
        }
        this._notes = _notes;

        _showBox.hide();
        _editBox.show().find('textarea').val(_notes);
    },
    _initSlideButton: function() {
        this._slideBtn.find('span').removeClass('eh-pedding-button-left-disabled eh-pedding-button-right-disabled');

        if (this.slide.allPage == 1 || this.slide.allPage == 0) {
            this._slideBtn.find('span[direction="left"]').addClass('eh-pedding-button-left-disabled');
            this._slideBtn.find('span[direction="right"]').addClass('eh-pedding-button-right-disabled');
        } else if (this.slide.currentPage == 1) {
            this._slideBtn.find('span[direction="left"]').addClass('eh-pedding-button-left-disabled');
        } else if (this.slide.allPage == this.slide.currentPage) {
            this._slideBtn.find('span[direction="right"]').addClass('eh-pedding-button-right-disabled');
        }
    },
    //初始化滑动
    _initSlideList: function() {
        var _self = this;

        this.slide = new Slide({
            list: this._pendingList,
            item: this._pendingList.find('li'),
            pageSize: 3,
            listWidth: '100%',
            itemWidth: '33%',
            leftButton: $('[data-role="eh-pedding-slide-button"][direction="left"]'),
            rightButton: $('[data-role="eh-pedding-slide-button"][direction="right"]'),
            initCallback: function() {},
            buttonCallback: function(dir) {
                if (dir == 'right') {
                    if ((this.allPage - this.currentPage == 1) && _self._pendingCurPage < _self._pendingTotal) {
                        _self._pendingCurPage++;
                        _self._getPendingListData('more');
                    }
                }
                _self._initSlideButton();
            }
        });
    },
    //初始化元素
    _initElement: function() {
        var _self = this;
        this.offset = 1;
        this._concactcurPage = 1;
        this._total = 1;
        this._pendingScope = '2';
        this._pendingStatus = 'Pending';
        this._pendingCurPage = 1;
        this._pendingTotal = 0;
        this._pendingList = $('#eh-pedding-people-list');
        this._concactList = $('#eh-my-concact-list');
        this._paginationEl = $('#pagination');
        this._nopendingBox = $('#eh-nopending-box');
        this._nocontactBox = $('#eh-nocontact-box');
        this._pendingCount = $('#eh-pending-count');
        this._contactCount = $('#eh-contact-count');
        this._slideBtn = $('[data-role="eh-pedding-slide-button"]');

        this._inform = require('../inform/index.js');
    },
    //渲染pending application 列表
    _renderPendingList: function(data) {
        var _listHtml = Handlebars.compile(_pendingItemTpl)({ 'data': data });
        this._pendingList.append(_listHtml);
    },
    //渲染联系人列表
    _renderConcactList: function(data) {
        var _concactHtml = Handlebars.compile(_concactManItemTpl)({ 'data': data });
        this._concactList.html(_concactHtml);
    },
    //初始化分页器
    _initPagination: function(res) {
        this._total = res.totalPage;
        this._concactcurPage = res.currentPage;
        this._pagination = new PaginationComplex({
            parentNode: this._paginationEl,
            total: this._total,
            current: this._concactcurPage,
            pageEscape: '%page%'
        }).render();
        // 翻页事件
        this._pagination.on('turn', this._turnPage.bind(this));
    },
    //跳页
    _turnPage: function(to) {
        var _self = this;
        this._concactLoading.show();
        this._concactcurPage = to;
        this._pagination.set('current', to);
        this._getManListData({
            url: this.get('contactListUrl'),
            type: 'contact-list',
            curPage: this._concactcurPage,
            pageSize: 4,
            scope: 0,
            status: 'Success',
            callback: function() {
                _self._initTextarea(arguments[0]);
                _self._concactLoading.hide();
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
    _informDialog: function(e) {
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-concact"]');
        var userId = _parent.attr('userid');
        var userName = _parent.find('.eh-custm-mycon-name').html();
        var userPhoto = _parent.find('img').attr('src');

        this._inform.show({
            userId: userId,
            userName: userName,
            userPhoto: userPhoto
        });
    },
    _turnToCompanyInfo: function(e){
        var _target = $(e.target);
        var _companyId = _target.attr('companyId');

        window.open("/company.htm?id=" + _companyId);
    }

});


module.exports = Index;
