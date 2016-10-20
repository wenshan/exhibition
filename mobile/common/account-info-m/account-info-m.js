var $ = require('/mobile/common/zepto/zepto');
var Widget = require('alpha-widget/widget');
var handlebars = require('alpha-handlebars/handlebars');
var Templatable = require('alpha-templatable/templatable');
var TemplatableTpl = require('./account-info-m.tpl');

var ajax = require('/mobile/common/components/ajax/ajax');

var accountInfo = Widget.extend({
    Implements: [Templatable, ajax],
    attrs: {
        muenid: "#sile-menu",
        element: '[data-role="element"]',
        url: "/dashboard/ajax/user/detail.do"
    },
    setup: function() {
        accountInfo.superclass.setup.call(this);
        this.element = $('[data-role="element"]');
        this.muenid = $("#sile-menu").addClass('animated');
        this._getUserInfo();
        this._events();
    },
    _events: function() {
        var self = this;
        var node = $(".eh-header-filter");

        node.on('click', function() {
            self._show();
            return false;
        });

        $(".close").on("click", function() {
            self._hide();
        })
        var padnoe = this.element.find(".en-header-info");
        var padnoe2 = this.element.find(".eh-content");
        var padnoe3 = this.element.find(".eh-header-search");

        padnoe2.on("click", function() {
            self._hide();
        });
        padnoe.on("click", function() {
            self._hide();
        });
        padnoe3.on("click", function() {
            self._hide();
        });
    },
    _show: function() {
        var self = this;
        this.muenid.parent().append('<div data-role="account-masker" class="eh-account-masker"></div>');

        $('[data-role="account-masker"]').show().off('click').on('click', function(e) {
            self._hide();
        });

        this.muenid.removeClass('slideOutLeft').addClass('slideInLeft').show();
    },
    _hide: function() {
        var el = this.muenid;

        el.removeClass('slideInLeft').addClass('slideOutLeft');

        // 以防不支持
        setTimeout(function() {
            el.hide();
        }, 300);

        $('[data-role="account-masker"]').remove();
    },
    _getUserInfo: function() {
        var self = this;
        var html = "";
        var node = $("#sile-menu-com");

        var isLogined = this.get('isLogined');

        if (this.get('isLogined').toString() == "true") {
            this.send({
                url: '/dashboard/ajax/user/detail.do'
            }).then(function(returnData) {

                if (returnData && returnData.data) {
                    returnData.data["isLogined"] = true;

                    html = self.compile(TemplatableTpl, returnData.data);
                    $("#sile-menu-com").html(html);
                }
            });
        } else {
            html = self.compile(TemplatableTpl, {});
        }

        $("#sile-menu-com").html(html);
    },
    _autoHight: function() {
       var height = this.element.height();

       this.muenid.height(height);
    }
});

module.exports = accountInfo;
