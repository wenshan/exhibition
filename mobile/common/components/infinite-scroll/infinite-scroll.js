var $ = require('/mobile/common/zepto/zepto');

var windowEl = $(window);
var bodyEl = $(document.body);
var tpl = require('./src/footer.tpl');

// cb可以是一个Promise实例（如：this.send()），也可以是返回Promise实例的函数
module.exports = {
    addScroll: function(cb, $par, $sub) {
        $par = this._$parEl = $par || windowEl;
        $sub = $sub || bodyEl;

        var scrollEl = this._scrollerEl = $par || this.element;

        if (scrollEl && !$('[data-role="view-footer"]').length) {
            scrollEl.append(tpl);
        }

        var loadingEl = this._viewMoreLoadingEl = $('[data-role="view-more-loading"]');
        var viewMoreEl = this._viewMoreEl = $('[data-role="view-more"]');

        var deferred = $.Deferred();
        var cbArgs = [].slice.call(arguments, 1);

        this._scroll = function(e) {
            // 正在加载中就不再加载
            if (this._ajax) {
                return;
            }

            // 全部加载完请将该值设置为true
            if (this.loadedAll) {
                viewMoreEl.hide();
                loadingEl.hide();
                this._removeScroll();

                return;
            } else {
                viewMoreEl.hide();
            }

            this._scrollId && clearTimeout(this._scrollId);

            // 执行函数节流
            this._scrollId = setTimeout(function() {
                var viewH = $par.height();
                var scrollTop = scrollEl.scrollTop() || document.body.scrollTop;
                var contentH = scrollEl[0].scrollHeight || document.body.scrollHeight;

                if (contentH > viewH && contentH - viewH - scrollTop <= 50) {
                    loadingEl.show();
                    scrollEl[0].scrollTop += scrollEl[0].scrollTop + loadingEl.height();

                    this._ajax = (typeof cb === 'function' ? cb.apply(this) : cb).always(function(returnData) {
                        // ajax结束后将this._ajax设置为false
                        this._ajax = null;
                        loadingEl.hide();

                        deferred.resolve(returnData);
                    }.bind(this));
                }

            }.bind(this), 16);
        }.bind(this);

        $par.scroll(this._scroll.bind(this));

        return deferred;
    },

    _removeScroll: function(deleteFooter) {
        this._$parEl.off('scroll', this._scroll);

        deleteFooter && this._scrollerEl.find('[data-role="view-footer"]').remove();
    }
};
