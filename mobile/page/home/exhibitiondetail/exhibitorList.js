var $ = require("/mobile/common/zepto/zepto");
var Widget = require("/mobile/common/widget");
var MessageTip = require('scc-bp-message-tip/message-tip');
var Handlebars = require('scc-bp-handlebars/handlebars');

//取得名字的第一个字母或汉字
Handlebars.registerHelper('photoLetter', function(name) {
    return name.charAt(0).toUpperCase();
});
Handlebars.registerHelper('showMainProduct', function(arr) {
    return arr.join(' / ');
});
Handlebars.registerHelper('getArrayData', function(arr, index) {
    return arr ? arr[index] : '';
});

var infiniteScroll = require('../../../common/components/infinite-scroll/infinite-scroll');

var exhibitorListTpl = require('./src/exhibitor.tpl');
var exhibitInformTpl = require('./src/exhibitInformer.tpl');
var ehListTpl = require('./src/exhibitorList.tpl');

var List = Widget.extend({
    Implements: [infiniteScroll],
    setup: function() {
        List.superclass.setup.call(this);
        this._initElement();
        this._initBannerData();
        this._renderExhibitorList();
        this._renderExhibitInformerList();
        this._ehBasenfo();
        this._initAddScroll();
    },
    events: {
        'click [data-role="add-watch-list"]': '_addWatchList'
    },
    _initAddScroll: function() {
        var _self = this;
        this.scrollStatus = false;
        var _timer = null;
        this.element.bind('touchmove', function() {
            var allH = $('body').height();
            var scrollTop = $('body').scrollTop();
            var windowH = $(window).height();

            if (allH - scrollTop - windowH <= 50 && !_self.scrollStatus) {
                _self.scrollStatus = true;
                _self._renderExhibitorList();
                $('[data-role="list-loading-helper"]').show();
                clearTimeout(_timer);
                _timer = setTimeout(function() {
                    $('[data-role="list-loading-helper"]').hide();
                    _self.scrollStatus = false;
                }, 2000);
            }
        });
    },
    _initBannerData: function() {
        var data = $('#exhibitionDetailData').val();
        data = $.parseJSON(data);
        this.set('exhibitionId', data.exhibitionId);
    },
    _fillList: function(data) {
        var _html = Handlebars.compile(ehListTpl)(data);
        this.ehList.append(_html);
    },
    _judgeConnected: function(res) {
        var _self = this;
        var comId = [];
        for (var i = 0; i < res.data.items.length; i++) {
            comId.push(res.data.items[i].id);
        }
        _self.send({
            url: '/dashboard/ajax/connect/connectCompanyList.do',
            type: 'POST',
            dataType: 'json',
            data: {
                companyIds: comId.join(',')
            },
            onSuccess: function(r) {
                for (var i = 0; i < r.data.length; i++) {
                    for (var j = 0; j < res.data.items.length; j++) {
                        if (r.data[i].companyId == res.data.items[j].id) {
                            res.data.items[j].hasConnect = r.data[i].hasConnect;
                            res.data.items[j]["companyId"] = r.data[i].companyId;
                            break;
                        }
                    }
                }

                var _html = Handlebars.compile(exhibitorListTpl)({
                    'data': res.data
                });
                if (_self.initFlag) {
                    _self.initFlag = false;
                    _self.ehList.append(_html);
                }
                _self._fillList(res);
            },
            onFailure: function(r) {

                if (r.code == 300) {
                    _self.loginStatus = false;
                }
                var _html = Handlebars.compile(exhibitorListTpl)({
                    'data': res.data
                });
                $('[data-role="exhibit-informer"]').hide();
                if (_self.initFlag) {
                    _self.initFlag = false;
                    _self.ehList.append(_html);
                }
                _self._fillList(res);
            }
        });
    },
    _renderExhibitorList: function() {
        var _self = this;
        this.send({
            url: '/ajax/exhibition/ExhibitorList.do',
            type: 'POST',
            dataType: 'json',
            data: {
                curPage: this._curPage,
                pageSize: 12,
                exhibitionId: this.get('exhibitionId')
            },
            onSuccess: function(res) {

                if (res.code == 200) {
                    //$('[data-role="exhibit-informer"]').hide();
                    if (!res.data.items || res.data.items.length == 0) {

                        _self.ehList.html('<p class="no-exhibitor-tips-word">No exhibitor has attended this event yet. You can invite companies you are interested in to attend.</p>');
                    } else if (_self._curPage > res.data.totalPage) {

                    } else {
                        _self._curPage++;
                        _self._judgeConnected(res);
                    }
                }

            }
        });
    },
    _renderExhibitInformerList: function() {
        var _self = this;
        this.send({
            url: '/ajax/exhibition/ExhibitorWithInformList.do',
            type: 'POST',
            dataType: 'json',
            data: {
                curPage: 1,
                pageSize: 4,
                exhibitionId: this.get('exhibitionId')
            },
            onSuccess: function(res) {
                if (res.code == 200) {
                    if (res.data.totalItem.length == 1) {
                        $('[data-role="exhibitor-with-inform-count"]').html(res.data.totalItem + 'Company');
                    } else {
                        $('[data-role="exhibitor-with-inform-count"]').html(res.data.totalItem + 'Companies');
                    }
                    if (!res.data.items || res.data.items.length == 0) {
                        $(".view-all").hide();
                        //$(".eh-exhibitor-here").hide();
                        $('[data-role="exhibit-informer"]').hide();
                        $('[data-role="exhibitor-with-inform-count"]').html('0Company');
                    } else {
                        var _html = Handlebars.compile(exhibitInformTpl)({
                            'data': res.data
                        });
                        _self._exhibitInformer.html(_html);
                    }
                }
            },
            onFailure: function(res) {
                if (res.code == 300) {
                    $('[data-role="exhibit-informer"]').hide();
                    $('[data-role="exhibitor-with-inform-count"]').html('0Company');
                    $(".view-all").hide();
                    //$(".eh-exhibitor-here").hide();
                }
            }
        });
    },
    _initElement: function() {
        this.ehInformList = $('#exhibitInformer-list');
        this.ehList = $('#ehList');
        this.exhListWrap = $('#eh-exhibitor-list-warp');
        this._exhibitInformer = $('#exhibitInformer-list');
        this._curPage = 1;

        this.initFlag = true;
    },
    _addWatchList: function(e) {
        var _target = $(e.target);
        console.log(_target);
        var _parent = _target.parents('[data-role="one-compnay"]');

        var cmId = _parent.attr('companyid');
        var opt = '';

        if (this.loginStatus == false) {
            window.location.href = '/login.htm?toUrl=' + window.location.href;
        }
        if (_parent.attr('watch') == 'no') {
            _parent.find('.the-heart').addClass('active');
            opt = 'watch';
            _parent.attr('watch', 'yes');
        } else {
            _parent.find('.the-heart').removeClass('active');
            opt = 'unwatch';
            _parent.attr('watch', 'no');
        }
        this.send({
            url: '/dashboard/ajax/watch/updateWatch.do',
            type: 'POST',
            dataType: 'json',
            data: {
                companyId: cmId,
                opt: opt
            },
            onSuccess: function(res) {
                if (res.code == 200) {
                    if (_parent.attr('watch') == 'no') {
                        MessageTip.success('Removed from Watch List ');
                    } else {
                        MessageTip.success('Added to Watch List ');
                    }
                }
            }
        });
    },
    _ehBasenfo: function() {
        var data = $("#exhibitionDetailData").val();
        var objData = JSON.parse(data);
        var name = objData.exhibitionStartTime + "--" + objData.exhibitionEntTime;

        for (var key in objData) {
            if (objData[key]) {
                objData[key] = objData[key].toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
        }

        this.element.find(".text-time").html(name);
        this.element.find(".text-name").html(objData.exhibitionName);
    }


});


module.exports = List;
