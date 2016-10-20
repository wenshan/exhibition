var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var handlebars = require('scc-bp-handlebars/handlebars');
var IScroll = require('../../../common/components/iscroll/iscroll-lite');
var moment = require('alpha-moment/moment');

require('../../../common/components/zepto-modals/modals');
require('../../../common/components/zepto-calendar/calendar');

var exhitionDetailTpl = require('./src/exhibition-detail.tpl');

var $$ = $;

handlebars.registerHelper('showIndustries', function(exhibitionIndustry) {
    return (exhibitionIndustry || []).join(' / ');
});

handlebars.registerHelper('showExhNum', function(exhibitorNumber) {
    exhibitorNumber = exhibitorNumber || 0;

    return exhibitorNumber + ((!exhibitorNumber || exhibitorNumber > 1) ? ' Exhibitions' : ' Exhibition');
});

handlebars.registerHelper('showVisitorNum', function(visitorNumber) {
    visitorNumber = visitorNumber || 0;

    return visitorNumber + ((!visitorNumber || visitorNumber > 1) ? ' Visitors' : ' Visitor');
});

handlebars.registerHelper('showDate', function(date) {
    return (date || '').replace(/\-/g, '.');
});

handlebars.registerHelper('showPics', function(picList) {
    var ary = [];

    $.each(picList || [], function(index, item) {
        ary.push(
            ['<li class="eh-pics-item">',
                '<div class="eh-pics-item-inner" style="background-image: url(' + item + ');"></div>',
                '</li>'
            ].join(''));
    });

    return new handlebars.SafeString(ary.join(''));
});


module.exports = Widget.extend({
    attrs: {
        'plannerList': '/dashboard/ajax/schedule/myList.do',
        'plannerDetail': '/dashboard/ajax/exhibition/simpleDetail.do'
    },

    events: {

    },

    setup: function(config) {
        this.constructor.superclass.setup.call(this);

        this._init();
        this._initCallendar();
    },

    _init: function() {
        $$ = this.$.bind(this);

        this._curMon = moment(new Date()).format('YYYY-MM');

        this._isFirstInit = true;
    },

    _initCallendar: function() {
        $$('[data-role="calendar-render"]').calendar({
            value: [],
            onMonthAdd: function(p) {
                if (this._ajaxList && !this._isFirstInit) {
                    this._ajaxList.abort();
                }

                var mon = Number(p.currentMonth) + 1;
                mon = mon > 9 ? mon : '0' + mon;

                this._curMon = p.currentYear + '-' + mon;

                !this._ajaxList && this._getPlannerList();

                this._clearCalendar();
            }.bind(this),
            onDayClick: function(p, el) {
                el = $(el);

                this._isFirstInit = false;

                if (el.find('[data-role="has-date"]').is(':visible')) {
                    $('[data-role="exhibition-list"]').find('[data-role="eh-item"]').remove().end().find('[data-role="list-loading-helper"]').show();
                }

                // 获取该日期所在的展会列表ids
                var curDate = el.attr('data-date');
                if (this._getDateExhIds(curDate)) {
                    this._renderExhibitionDetail(this._getDateExhIds(curDate));
                } else {
                    $$('[data-role="exhibition-list"]').html('<li class="eh-list-no-res eh-item" data-role="no-result">Nothing Here~</li>');
                }
            }.bind(this)
        });

        $$('[data-role="exhibition-list"]').html('');

        !this._ajaxList && this._getPlannerList();
    },

    _clearCalendar: function() {
        $$('[data-role="exhibition-list"]').html('');

        $('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
    },

    _getDateExhIds: function(date) {
        var ary = [];

        $.each(this._exhibitionList, function(index, item) {
            var startTime = new Date(item.startTime).getTime();
            var endTime = new Date(item.endTime).getTime();
            var curTime = new Date(date).getTime();

            if (curTime >= startTime && curTime <= endTime) {
                ary.push(item.targetId);
            }
        })

        return ary.join(',');
    },

    _getPlannerList: function(date) {
        var reqDate = this._reqDate = this._getDate();

        (this._ajaxList = this.send({
            url: this.get('plannerList'),
            data: reqDate
        })).then(function(returnData) {
            $.each(returnData.data, function(index, item) {
                var targetEl = $('[data-date="' + item.startTime + '"] [data-role="has-date"]');
                var exhitionIdExist = targetEl.attr('exhibitionId');
                var ary = [item.targetId];
                exhitionIdExist && ary.push(exhitionIdExist);

                targetEl.attr({
                    'exhibitionId': ary.join(',')
                }).show().closest('.picker-calendar-day').attr({
                    'exhibitionId': ary.join(',')
                });
            });

            this._exhibitionList = returnData.data;

            this._renderCalendarDates();

            // this._renderExhibitionDetail();
        }.bind(this)).always(function() {
            this._ajaxList = null;
        }.bind(this));
    },

    _renderExhibitionDetail: function(exhibitionId) {
        var minimumDate = this._getMinimumDate();

        $('[data-date].picker-calendar-day').removeClass('picker-calendar-day-selected');

        if (!exhibitionId && minimumDate) {
            var parEl = $('[data-date="' + minimumDate + '"].picker-calendar-day');

            exhibitionId = parEl.find('[exhibitionId]').attr('exhibitionId');
        }

        var listEl = $$('[data-role="exhibition-list"]');
        listEl.find('[data-role="list-loading-helper"]').hide().end().find('[data-role="no-result"]').remove();

        if (!exhibitionId) {
            listEl.html('<li class="eh-list-no-res eh-item" data-role="no-result">Nothing Here~</li>');
            return;
        }

        exhibitionId = exhibitionId.split(',');

        $.each(exhibitionId, function(index, item) {
            this.send({
                url: this.get('plannerDetail'),
                data: {
                    exhibitionId: item
                }
            }).then(function(returnData) {
                returnData.data.origin = this._getDateStartAndEnd(item);

                listEl.append(handlebars.compile(exhitionDetailTpl)(returnData.data));
            }.bind(this));
        }.bind(this));
    },

    _renderCalendarDates: function() {
        $('.picker-calendar-month-current [data-date].picker-calendar-day').each(function(index, item) {
            item = $(item);
            var date = new Date(item.attr('data-date')).getTime();

            $.each(this._exhibitionList, function(ind, exh) {
                var startTime = new Date(exh.startTime).getTime();
                var endTime = new Date(exh.endTime).getTime();

                if (date >= startTime && date <= endTime) {
                    item.find('[data-role="has-date"]').show();
                }
            });
        }.bind(this));
    },

    _getDateStartAndEnd: function(exhibitionId) {
        var result = {};

        $.each(this._exhibitionList, function(index, item) {
            if (exhibitionId == item.targetId) {
                result = item;
            }
        });

        return result;
    },

    _getMinimumDate: function() {
        var result = 0;
        var startTime = new Date(this._reqDate.startTime).getTime();

        $.each(this._exhibitionList, function(index, item) {
            if (item && item.startTime) {
                var itemStartTime = new Date(item.startTime).getTime();

                if (startTime > itemStartTime) {
                    return;
                }

                result = result || item.startTime;

                var resTime = new Date(result).getTime();

                if (resTime > startTime && resTime > itemStartTime) {
                    result = item.startTime;
                }
            }
        });

        return result;
    },

    _getDate: function(curMon) {
        curMon = this._curMon || 'YYYY-MM';

        // 获取当月有几天
        var monLen = moment(curMon, "YYYY-MM").daysInMonth();

        var curStartDate = curMon + '-01';
        var curLastDate = curMon + '-' + monLen;

        // 获取前面需要减几天
        var firstDayWeek = new Date(moment().format(curStartDate)).getDay() % 7 - 1;

        // 获取需要加几天
        var needAdd = 6 * 7 - firstDayWeek - monLen;


        // 起始日期
        var startDate = moment(moment().format(curStartDate)).subtract(firstDayWeek, 'days').format('YYYY-MM-DD');

        // 结束日期
        var endDate = moment(moment().format(curLastDate)).add(needAdd, 'days').format('YYYY-MM-DD');


        return {
            startTime: startDate,
            endTime: endDate
        };
    }
});
