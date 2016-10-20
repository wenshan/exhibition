var $ = require('/mobile/common/zepto/zepto');
var bodyEl = $(document.body);

module.exports = {
    _goTopInited: false,

    initGoTop: function() {
        if (this._goTopInited) {
            return;
        }

        this._goTopInited = true;

        var goEl = $('[data-role="go-top"]');

        if (!goEl.length) {
            goEl = $('<i class="eh-go-top" data-role="go-top"></i>').appendTo(bodyEl);
        }

        this._judgeGoTopElShow(goEl);

        goEl.on('click', this._scrollTop.bind(this, goEl));
    },

    _scrollTop: function(goEl) {
        scroll(0, 300, function() {
            goEl.hide();
        });
    },

    _judgeGoTopElShow: function(goEl) {
        var backToTopFun = function() {
            var st = bodyEl.scrollTop(),
                winh = $(window).height();

            if (st > 0) {
                goEl.css({
                    display: 'block'
                });
            } else {
                goEl.hide();
            }
        };

        $(window).on("scroll", backToTopFun);

        backToTopFun();
    }
};

function scroll(scrollTo, time, cb) {
    var scrollFrom = parseInt(document.body.scrollTop),
        i = 0,
        runEvery = 5; // run every 5ms
    scrollTo = parseInt(scrollTo);
    time /= runEvery;
    var interval = setInterval(function() {
        i++;
        document.body.scrollTop = (scrollTo - scrollFrom) / time * i + scrollFrom;
        if (i >= time) {
            cb && cb();
            clearInterval(interval);
        }
    }, runEvery);
}
