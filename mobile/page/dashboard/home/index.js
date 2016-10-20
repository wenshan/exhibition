var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var Handlebars = require('scc-bp-handlebars/handlebars');
var textarea = require('../../../common/components/textarea/textarea');

var bannerTpl = require('./src/banner.tpl');
var navTpl = require('./src/nav.tpl');
var ehListTpl = require('./src/exhibition.tpl');

require('../../../common/components/zepto-modals/modals');

Handlebars.registerHelper('photoLetter', function(name) {
    return name.charAt(0).toUpperCase();
});
Handlebars.registerHelper('overNumber', function(number) {
    if (number > 99) {
        return '99+';
    } else {
        return number;
    }
});

var _loading = '<div class="eh-loading-helper" data-role="list-loading-helper"><span class="eh-loading-pic"></span><span class="eh-loading-text">Loading......</span></div>';

var Index = Widget.extend({
    setup: function() {
        this.constructor.superclass.setup.call(this);
        this._initElement();
        this._renderBanner();
        this._renderEhList();
        this.initGoTop();
    },
    events: {
        'click [data-role="one-exhibition"]': '_turnToExPage',
        'click #exlist-view-more': '_viewMore'
    },
    _viewMore: function() {
        this._renderEhList();
    },
    _turnToExPage: function(e) {
        var _target = $(e.target);
        _target = _target.attr('data-role') == 'one-exhibition' ? _target : _target.parents('[data-role="one-exhibition"]');
        var exId = _target.attr('ehId');
        window.location.href = '/exhibitiondetail.htm?exhibitionId=' + exId;
    },
    _renderBanner: function() {
        var _self = this;
        this.send({
            url: '/dashboard/ajax/user/detail.do',
            type: 'POST',
            dataType: 'json',
            data: {},
            onSuccess: function(res) {
                if (res.code == 200) {
                    var _bannerHtml = Handlebars.compile(bannerTpl)({ 'data': res.data });
                    var _navHtml = Handlebars.compile(navTpl)({ 'data': res.data });
                    _self._bannerWrap.html(_bannerHtml);
                    _self._navWrap.html(_navHtml);
                }
            }
        });
    },
    _renderEhList: function() {
        var _self = this;
        this._ehListWrap.append(_loading);
        this.send({
            url: '/dashboard/ajax/exhibition/latestList.do',
            type: 'POST',
            dataType: 'json',
            data: {
                curPage: this._curPage,
                pageSize: 3
            },
            onSuccess: function(res) {
                _self._ehListWrap.find('[data-role="list-loading-helper"]').remove();
                if (res.code == 200) {

                    if (!res.data.items || res.data.items.length == 0) {
                        if (_self._initFlag) {
                            _self._ehListWrap.hide();
                            _self._viewMoreButton.hide();
                            _self._noResult.show();
                        }
                        else
                        {
                            _self._viewMoreButton.hide();
                        }

                    } else {
                        var _html = Handlebars.compile(ehListTpl)({ 'data': res.data });
                        _self._ehListWrap.append(_html);
                        _self._curPage++;
                    }
                    _self._initFlag = false;
                }
            }
        });
    },
    _initElement: function() {
        this._bannerWrap = $('#eh-dashborad-index-banner');
        this._navWrap = $('#eh-dashborad-index-nav');
        this._ehListWrap = $('#eh-dashborad-index-exhibition-list');
        this._noResult = $('#eh-search-404');
        this._viewMoreButton = $('#exlist-view-more');

        this._curPage = 1;
        this._initFlag = true;
    }
});

module.exports = Index;
