var $ = require("/mobile/common/zepto/zepto");
var IScroll = require("/mobile/common/components/iscroll/iscroll");
var Widget = require("/mobile/common/widget");
var Overview = require("/mobile/common/components/overview/overview");
var MessageTip = require('scc-bp-message-tip/message-tip');
var Templatable = require('alpha-templatable/templatable');

var IndexIscroll = Widget.extend({
    Implements: [Templatable],
    attrs: {
        element: "[data-role='element']",
        joinUrl: "/ajax/exhibition/apply.do",
        visitUrl: "/ajax/exhibition/attend.do"
    },
    events: {
        //'click [data-role="add-watch-list"]': '_addWatchList'
        //'click .exhibitor': '_join',
        //'click .visitor': '_visit'
    },
    setup: function() {
        IndexIscroll.superclass.setup.call(this);
        this._scroll();
        this._tab();
        this._overview();
        this._ehBasenfo();
        this.initGoTop();
    },
    _scroll: function() {
        new IScroll("#wrapper", {
            eventPassthrough: false,
            scrollX: true,
            scrollY: false,
            snap: false,
            momentum: true,
            deceleration: 0.0006,
            probeType: 2,
            scrollbars: false,
            mouseWheel: true,
            shrinkScrollbars: 'scale',
            tap: false
        });
    },
    _tab: function() {
        var element = $('[data-role="element"]');
        var menu = element.find(".en-tab-wrap ul li.item");
        var content = element.find(".eh-content-wrap");

        var index = 0;

        menu.on("click", function() {
            index = menu.index($(this));
            $(this).addClass("current").siblings().removeClass("current");
            $(content).eq(index).css("display", "block").siblings().css("display", "none");
        });
    },
    _overview: function() {
        new Overview({
            element: "#overview",
            moreClass: "more",
            lessClass: "less",
            scrollHeigt: 56
        });
    },
    _join: function() {
        var postData = {
            "exhibitionId": this.get("exhibitionId")
        };
        $.ajax({
            type: "POST",
            url: this.get("joinUrl"),
            dataType: "json",
            data: postData
        }).done(function(data) {
            if (!data) {
                return false;
            }
            if (data.data && data.data.toUrl && data.data.toUrl != "") {
                location.href = data.data.toUrl;
            } else {
                //console.log(data.errorMsg);
            }
        });
    },
    _visit: function() {
        var postData = {
            "exhibitionId": this.get("exhibitionId")
        };
        $.ajax({
            type: "POST",
            url: this.get("visitUrl"),
            data: postData
        }).done(function(data) {
            if (!data) {
                return false;
            }
            if (data.data && data.data.toUrl && data.data.toUrl != "") {
                location.href = data.data.toUrl;
            } else {
                //console.log(data.errorMsg);
            }
        });
    },
    _ehBasenfo: function() {
        var element = $("[data-role='element']");
        var data = $("#exhibitionDetailData").val();
        var objData = JSON.parse(data);
        var templata = '<ul><li><p><i class="icon icon-address"></i></p><p>{{exhibitionAddressCity}}, {{exhibitionAddressCountryName}}</p></li><li><p class="text">{{exhibitorNumber}}</p><p>{{Exhibitors}}</p></li><li><p class="text">{{visitorNumber}}</p><p>{{Visitors}}</p></li></ul>';

        if (objData.exhibitorNumber == 1) {
            objData["Exhibitors"] = "Exhibitor";
        } else {
            objData["Exhibitors"] = "Exhibitors";
        }

        if (objData.visitorNumber == 1) {
            objData["Visitors"] = "Visitor";
        } else {
            objData["Visitors"] = "Visitors";
        }

        for (var key in objData) {
            if (objData[key]) {
                objData[key] = objData[key].toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
        }

        var html = this.compile(templata, objData);

        element.find(".eh-base-info").html(html);
        var name = objData.exhibitionStartTime + "--" + objData.exhibitionEntTime;
        element.find(".text-time").html(name);
        element.find(".text-name").html(objData.exhibitionName);
    }
});
module.exports = IndexIscroll;
