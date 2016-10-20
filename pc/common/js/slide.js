var $ = require('alpha-jquery/jquery');
var Widget = require('alpha-widget/widget');

var $$ = this;

/**
    list    滚动列表的包裹曾 必填
    item    是列表内的项  必填
    pageSize  每次滑动的个数 必填
    leftButton 左滑按钮  必填
    rightButton 右滑按钮  必填
    initCallback 初始化的回调   可选
    buttonCallback 点击按钮后如果还需要执行额外函数，
                    可以通过这个参数来执行，并且该函数的参数是 left 或者 right,
                    并且currentPage 和allPage等都可以通过this 调用
    listWidth   list 的原始宽度，如果没有设置会自动获取 可选
    itemWidth    item 的原始宽度，如果没有设置会自动获取 可选
 */

var Slide = Widget.extend({

    setup: function() {
        $$ = this;
        Slide.superclass.setup.apply(this, arguments);

        this._initStyle();
        this._initEvent();
    },
    _initStyle: function() {
        this._initElements();
        this.slideList.width(this.originalListWidth);
        this.slideItem.width(this.slideItem.width());
        //this.slideList.css({ left: 0 });

        this.slideList.width(this.slideWidth * this.slideLength);
        if (this.get('initCallback') && typeof this.get('initCallback') == 'function') {
            this.get('initCallback').call(this);
        }
    },
    _initElements: function() {
        this.slideList = this.get('list');
        this.slideItem = this.get('item');
        this.pageSize = this.get('pageSize');
        this.leftButton = this.get('leftButton');
        this.rightButton = this.get('rightButton');

        this.slideLength = this.slideItem.length;
        this.allPage = Math.ceil(this.slideLength / this.get('pageSize'));
        this.originalListWidth = this.get('listWidth') || this.slideList.width();
        this.originalItemWidth = this.get('itemWidth') || this.slideItem.width();

        this.slideWidth = this.slideItem.width();
        this.slideWidth += parseInt(this.slideItem.css('paddingLeft')?this.slideItem.css('paddingLeft'):0);

        this.slideWidth += parseInt(this.slideItem.css('paddingRight')?this.slideItem.css('paddingRight'):0);

        this.slideWidth += parseInt(this.slideItem.css('marginLeft')?this.slideItem.css('marginLeft'):0);
        this.slideWidth += parseInt(this.slideItem.css('marginRight')?this.slideItem.css('marginRight'):0);

        this.slideWidth += parseInt(this.slideItem.css('border-left-width')?this.slideItem.css('border-left-width'):0);
        this.slideWidth += parseInt(this.slideItem.css('border-right-width')?this.slideItem.css('border-right-width'):0);

        this.currentPage = Math.ceil(Math.abs(this.slideList.position().left / this.slideWidth) / this.pageSize) + 1;

        this.currentPage = this.currentPage == 0 ? 1 : this.currentPage;

    },
    _initEvent: function() {
        this.leftButton.on('click', _leftClick);
        this.rightButton.on('click', _rightClick);

        function _leftClick() {

            if ($$.currentPage > 1) {
                $$.currentPage--;
                $$.slideList.animate({
                    left: $$.slideList.position().left + $$.slideWidth * $$.pageSize
                }, 100);
                if ($$.get('buttonCallback') && typeof $$.get('buttonCallback') == 'function') {
                    $$.get('buttonCallback').apply($$, ['left']);
                }
            }
        }

        function _rightClick() {

            if ($$.currentPage < $$.allPage) {
                $$.currentPage++;
                $$.slideList.animate({
                    left: $$.slideList.position().left - $$.slideWidth * $$.pageSize
                }, 100);
                if ($$.get('buttonCallback') && typeof $$.get('buttonCallback') == 'function') {
                    $$.get('buttonCallback').apply($$, ['right']);
                }
            }
        }
    }

});

module.exports = Slide;
