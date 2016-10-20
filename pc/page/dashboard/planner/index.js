var $ = require('alpha-jquery/jquery');
var handlebars = require('scc-bp-handlebars/handlebars');
var Widget = require('../../../common/js/widget-backend');
var fullCalendar = require('../../../common/fullcalendar/fullcalendar');
var moment = require('alpha-moment/moment');
var Balloon = require('/pc/common/balloon-animate/balloon');

var detailTpl = require('./src/detail.tpl');

var $$ = $;

// handlebars helper

handlebars.registerHelper('product', function(industryList) {
    return (industryList || []).join(' / ');
});

handlebars.registerHelper('picListRender', function(picList) {
    var ary = [];
    picList = (picList || []).slice(0, 3);

    $.each(picList, function(index, item) {
        ary.push('<li class="eh-exhibition-photo"><image src="' + item + '" class="ex-exhibition-pic"></li>');
    });

    return new handlebars.SafeString(ary.join(''));
});

handlebars.registerHelper('dateExec', function(date) {
    date = date || '';

    return date.replace(/\-/g, '.');
});

handlebars.registerHelper('showNumExh', function(num) {
    num = num || 0;

    return num + (num == 1 ? ' Exhibition' : ' Exhibitions');
});

handlebars.registerHelper('showNumVis', function(num) {
    num = num || 0;

    return num + (num == 1 ? ' Visitor' : ' Visitors');
});


var Index = Widget.extend({
    attrs: {
        'plannerList': '/dashboard/ajax/schedule/myList.do',
        'plannerDetail': '/dashboard/ajax/exhibition/simpleDetail.do'
    },

    setup: function() {
        Index.superclass.setup.call(this);

        this._initElements();
        this._initCalendar();
        this._ballooonClose();
    },

    _ballooonClose: function() {
        $(window).on('click', function() {
            $('.ui2-balloon').remove();
        });
    },

    _initElements: function() {
        $$ = this.$.bind($);

        this._calendarEl = $('[data-role="full-calendar"]');
    },

    _reqList: function(reqData) {
        if (this._ajaxForList) {
            this._ajaxForList.abort();
        }

        return ((this._ajaxForList = this.send({
            url: this.get('plannerList'),
            data: reqData
        })).then(function(returnData) {
            $('[data-role="loading-helper"]').remove();
            return (returnData = returnData.data);
        }));
    },

    _modifyMonths: function(yearAndMon, num) {
        return moment(yearAndMon).add(num, 'M').format('YYYY-MM');
    },

    _initCalendar: function() {
        this._calendarEl.fullCalendar({
            header: {
                left: 'title',
                center: 'prev,next today',
                right: ''
            },
            // defaultDate: '2016-03-10',
            editable: false,
            eventLimit: true, // allow "more" link when too many events
            lazyFetching: true,
            events: function(start, end, timezone, callback) {
                // 自动重新渲染
                this._reqList({
                    startTime: start.format('YYYY-MM-DD'),
                    endTime: end.format('YYYY-MM-DD')
                }).then(function(returnData) {
                    var events = this._composeEvents(returnData);

                    callback(events);
                }.bind(this));
            }.bind(this),
            eventClick: function(calEvent, jsEvent, view) {
                var currentTargetEl = $(jsEvent.currentTarget);
                var reqData = currentTargetEl.find('[data-extra]').data('extra');

                this.send({
                    url: this.get('plannerDetail'),
                    data: reqData
                }).then(function(returnData) {
                    console.log(returnData);

                    this._renderExhibitionDetail(currentTargetEl, returnData.data);
                }.bind(this));
            }.bind(this)
        });
    },

    // 渲染展会详情
    _renderExhibitionDetail: function(triggerEl, renderData) {
        renderData = renderData || {};

        $('.ui2-balloon').remove();

        var balloon = new Balloon({
            width: 400,
            trigger: triggerEl,
            triggerType: 'none',
            arrowPosition: 'tl',
            inViewport: true,
            hasCloseX: true,
            content: handlebars.compile(detailTpl)(renderData)
        }).show();
    },

    _composeEvents: function(dataAry) {
        // [{"endTime":"2016-01-02","startTime":"2016-01-01","targetId":1,"topic":"test01","type":"Exhibit"}]
        dataAry = dataAry || [];

        var ary = [];

        $.each(dataAry, function(index, item) {

            ary.push({
                title: item.topic,
                start: item.startTime,
                end: moment(item.endTime).add(1, 'days').format('YYYY-MM-DD'),
                extra: {
                    exhibitionId: item.targetId
                }
            });
        });

        return ary;
    }
});

module.exports = Index;
