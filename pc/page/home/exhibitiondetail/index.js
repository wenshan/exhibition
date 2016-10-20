var $ = require('alpha-jquery/jquery');
var Widget = require('../../../common/js/widget.js');
var Movingboxes = require('../../../common/js/movingboxes.js');
var PaginationComplex = require('alpha-pagination/pagination-complex');
var MessageTip = require('scc-bp-message-tip/message-tip');
var Handlebars = require('scc-bp-handlebars/handlebars');

var exhibitorListTpl = require('./src/exhibitorlist.tpl');
var exhibitInformerTpl = require('./src/exhibitinformer.tpl');
var bannerTpl = require('./src/banner.tpl');

Handlebars.registerHelper('getArrayData', function(arr, index) {
    return arr ? arr[index] : '';
});
//取得名字的第一个字母或汉字
Handlebars.registerHelper('photoLetter', function(name) {
    return name.charAt(0).toUpperCase();
});

Handlebars.registerHelper('showMainProduct', function(arr) {
    return arr.join(' / ');
});
//条件判断
Handlebars.registerHelper('equal', function(content, value, options) {
    if (content == value) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('overcount', function(number, max) {
    if (number > max) {
        return max + '+';
    } else {
        return number;
    }
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


var $$;

var Exd = Widget.extend({

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initBannerData();
        this._initElements();

        this._renderExhibitorList();
        this._renderExhibitInformerList();
        this._ehContentSlide();
    },
    events: {
        'click .eh-exhibition-tab-one': '_tab',
        'click [data-role="apply"]': '_apply',
        'click [data-role="attend"]': '_attend',
        'click [data-role="view-more-information"]': '_turnToDetailPage',
        'click [data-role="add-watch-list"]': '_addWatchList'
    },

    /*
     * 模块mm-eh-content-slide
     */
    _ehContentSlide: function() {
        Movingboxes.setup();
    },
    _attend: function() {
        this.send({
            url: '/ajax/exhibition/apply.do',
            type: 'POST',
            dataType: 'json',
            data: {
                exhibitionId: this.get('exhibitionId')
            },
            onSuccess: function(res) {
                if (res.code) {
                    window.open('http://survey.alibaba.com/survey/Awc41amF2');
                }
            }
        });
    },
    _apply: function() {
        this.send({
            url: '/ajax/exhibition/attend.do',
            type: 'POST',
            dataType: 'json',
            data: {
                exhibitionId: this.get('exhibitionId')
            },
            onSuccess: function(res) {
                if (res.code) {
                    window.open('http://survey.alibaba.com/survey/4MvJ2aCp2');
                }
            }
        });
    },
    _turnToDetailPage: function(e) {
        var _target = $(e.target);
        var _parent = _target.parents('[data-role="one-compnay"]');
        var _companyId = _parent.attr('companyid');

        window.open("/company.htm?id=" + _companyId);
    },
    _initPagination: function(res) {

        if (this.onceInitPage) {
            return false;
        }
        this.onceInitPage = true;
        var _self = this;
        this._pagination = new PaginationComplex({
            parentNode: _self._paginationEl,
            total: res.data.totalPage,
            current: _self._curPage,
            pageEscape: '%page%'
        }).render();
        this._pagination.on('turn', function(to) {
            console.log(to);
            _self._curPage = to;
            this.set('current', to);
            _self._renderExhibitorList();
        });
    },
    _initElements: function() {
        this._paginationEl = $('#pagination-wrap');
        this._tabButton = $('.eh-exhibition-tab-one');
        this._boxOne = $('.eh-exhibition-detail-tab-two');
        this._boxTwo = $('.eh-exhibition-detail-tab-one');
        this._exhibitInformer = $('#eh-exhibitor-box');
        this._exhibitorList = $('#exhibitor-list-wrap');

        this._curPage = 1;
        this.onceInitPage = false;
    },
    _tab: function(e) {
        var _target = $(e.target);
        this._tabButton.removeClass('eh-exhibition-tab-one-active');
        _target.addClass('eh-exhibition-tab-one-active');
        if (_target.attr('data-role') == 'tab1') {
            this._boxOne.show();
            this._boxTwo.hide();
        } else {
            this._boxTwo.show();
            this._boxOne.hide();
        }
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
                    if (res.data.totalItem == 1) {
                        $('[data-role="exhibitor-with-inform-count"]').html(res.data.totalItem + 'Company');
                    } else {
                        $('[data-role="exhibitor-with-inform-count"]').html(res.data.totalItem + 'Companies');
                    }
                    if (!res.data.items || res.data.items.length == 0) {
                        _self._exhibitInformer.hide();
                        $('[data-role="exhibit-informer"]').hide();
                    } else {
                        _self._exhibitInformer.show();
                        $('[data-role="exhibit-informer"]').show();
                        var _html = Handlebars.compile(exhibitInformerTpl)({ 'data': res.data });
                        _self._exhibitInformer.html(_html);
                    }
                }
            },
            onFailure: function(res) {
                if (res.code == 300) {
                    _self._exhibitInformer.hide();
                    $('[data-role="exhibit-informer"]').show();
                    $('[data-role="exhibitor-with-inform-count"]').html('0Companies');
                }
            }
        });
    },
    _judgeConnected: function(res) {
        var _self = this;
        var comId = [];
        _self._exhibitorList.show();
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
                            break;
                        }
                    }
                }
                _self._judgeWatch(comId.join(','), function(returnData) {
                    for (var i = 0; i < returnData.data.length; i++) {
                        for (var j = 0; j < res.data.items.length; j++) {
                            if (returnData.data[i].companyId == res.data.items[j].id) {
                                res.data.items[j].hasWatch = returnData.data[i].hasWatched;
                                break;
                            }
                        }
                    }
                    console.log(returnData);
                    var _html = Handlebars.compile(exhibitorListTpl)({ 'data': res.data });
                    _self._exhibitorList.html('');
                    _self._exhibitorList.html(_html);
                });
                $('[data-role="exhibit-informer"]').show();
            },
            onFailure: function(r) {
                if (r.code == 300) {
                    _self.loginStatus = false;
                }
                var _html = Handlebars.compile(exhibitorListTpl)({ 'data': res.data });
                _self._exhibitorList.html('');
                _self._exhibitorList.html(_html);
                $('[data-role="exhibit-informer"]').hide();
            }
        });
    },
    _renderExhibitorList: function() {
        var _self = this;
        this.send({
            url: ' /ajax/exhibition/ExhibitorList.do',
            type: 'POST',
            dataType: 'json',
            data: {
                curPage: this._curPage,
                pageSize: 24,
                exhibitionId: this.get('exhibitionId')
            },
            onSuccess: function(res) {

                if (res.code == 200) {
                    if (res.data.totalItem > 1) {
                        $('[data-role="exhibitor-count"]').html(res.data.totalItem + ' Exhibitors');
                    } else if (res.data.totalItem == 1) {
                        $('[data-role="exhibitor-count"]').html(res.data.totalItem + ' Exhibitor');
                    }

                    if (!res.data.items || res.data.items.length == 0) {
                        _self._exhibitorList.html('<p class="no-exhibitor-tips-word">No exhibitor has attended this event yet. You can invite companies you are interested in to attend.</p>');
                    } else {
                        _self._judgeConnected(res);
                    }
                    this._initPagination(res);

                }

            }
        });
    },
    _judgeWatch: function(cmids, cfn) {
        var _self = this;
        this.send({
            url: '/dashboard/ajax/watch/WatchCompanyList.do',
            type: 'GET',
            dataType: 'json',
            data: {
                companyIds: cmids
            },
            onSuccess: function(res) {
                if (res.code == 200) {
                    cfn.apply(_self, [res]);
                }
            }
        });
    },
    _initBannerData: function() {
        var data = $('#exhibitionDetailData').val();
        this._bannerBox = $('#eh-detail-banner-wrap');
        data = $.parseJSON(data);
        this.set('exhibitionId', data.exhibitionId);
        var _html = Handlebars.compile(bannerTpl)({ 'data': data });
        this._bannerBox.append(_html);
    },
    _addWatchList: function(e) {
        var _target = $(e.target);
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
    }

});


module.exports = Exd;
