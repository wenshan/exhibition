/**
 * slide 公用组件
 * @Author: xiangzhong.wxz@alibaba-inc.com
 * @Date: 2016-03-10
 * @features：
 * 1、使用velocity.js作为动画引擎，性能保障；
 * 2、左滑，右滑动画（滑动效果可自己制定，默认swing）；
 * 3、可指定显示片段数（默认4个）；
 * 4、支持响应式；
 * 5、实现简单高效（充分利用Widget的Getter/Setter）。
 */

var Widget = require('alpha-widget/widget');
var $ = require('alpha-jquery/jquery');
var Velocity = require('/pc/common/velocity/velocity')($);

var DISABLED_CLASS = 'disabled';

module.exports = Widget.extend({
    attrs: {
        duration: 500,
        easing: 'swing',
        element: '[data-role="slide-container"]',
        // 初始入口设置
        fragmentNum: {
            value: 4,

            getter: function(val) {
                return this.fragmentNum || val;
            },

            setter: function(num) {
                this._setBaseInfo(num);
            }
        },
        // 显示片段的数量
        slideItemWidth: 0,
        // 总的宽度
        totalLength: 0,
        // 已经移动的距离
        leftDistance: {
            value: 0,

            getter: function(val) {
                return this._leftDistance || val;
            },

            setter: function(val) {
                val = val || 0;

                this._leftDistance = val;

                var totalLength = this.get('totalLength');
                var containerWidth = this._cintainerEl.width();
                var itemsNum = this._slideItemEls.length;


                if (itemsNum <= this.get('fragmentNum') || (val + containerWidth) > totalLength || (this._leftMoveNum + 1) * this.get('fragmentNum') >= itemsNum) {
                    this._canMoveLeft = false;
                    this._leftTurnEl.addClass(DISABLED_CLASS);
                } else {
                    this._canMoveLeft = true;
                    this._leftTurnEl.removeClass(DISABLED_CLASS);
                }

                if (itemsNum <= this.get('fragmentNum') || val <= 0) {
                    this._canMoveRight = false;
                    this._rightTurnEl.addClass(DISABLED_CLASS);
                } else {
                    this._canMoveRight = true;
                    this._rightTurnEl.removeClass(DISABLED_CLASS);
                }
            }
        },
        cintainerEl: {
            length: 0
        },
        moveEl: {
            length: 0
        },
        slideItemEls: {
            length: 0
        },
        leftTurnEl: {
            length: 0
        },
        rightTurnEl: {
            length: 0
        }
    },

    events: {
        'click [data-role="left-turn"]': '_turnLeft',
        'click [data-role="right-turn"]': '_turnRight'
    },

    setup: function() {
        this.constructor.superclass.setup.call(this);

        this._initElements();

        this._initSet();

        this._resize();
    },

    _turnLeft: function(e) {
        if (this._moveEl.is(':animated') || this._leftTurnEl.hasClass(DISABLED_CLASS) || !this._canMoveLeft) {
            return;
        }

        // 在slide渲染完后可能又会出现滚动条，此时container宽度已改变，但此时并不触发resize事件
        // 所以重置下初始状态
        // this._resizeFunc();

        var elWidth = this._cintainerEl.width() + 1;

        this._leftMoveNum++;

        this._leftDistance = elWidth * this._leftMoveNum;

        this.set('leftDistance', this._leftDistance);

        this._move();
    },

    _turnRight: function(e) {
        if (this._moveEl.is(':animated') || this._rightTurnEl.hasClass(DISABLED_CLASS) || !this._canMoveRight) {
            return;
        }

        // this._resizeFunc();

        var elWidth = this._cintainerEl.width() + 1;

        this._leftMoveNum--;
        this._leftDistance = elWidth * this._leftMoveNum;

        this.set('leftDistance', this._leftDistance);

        this._move();
    },

    _move: function(left) {
        left = left || this._leftDistance;

        if (left >= this._moveEl.width()) {
            return;
        }

        this._moveEl.velocity({
            left: -left
        }, {
            duration: this.get('duration') || 500,
            easing: this.get('easing'),
            delay: false
        });
    },

    _initSet: function() {
        this.set('fragmentNum', this.get('fragmentNum') || 4);

        // this._leftDistance标识着已经往左移动的距离
        this.set('leftDistance', this._leftDistance = 0);
    },

    _initElements: function() {
        // 初始化各个元素
        this.set('moveEl', this._moveEl = $('[data-role="slide-move"]'));
        this.set('slideItemEls', this._slideItemEls = this.$('[data-role="slide-item"]'));
        this.set('leftTurnEl', this._leftTurnEl = this.$('[data-role="left-turn"]'));
        this.set('rightTurnEl', this._rightTurnEl = this.$('[data-role="right-turn"]'));
        this.set('cintainerEl', this._cintainerEl = this.$('[data-role="slide-outer"]'));

        this._leftMoveNum = 0;
    },

    _setBaseInfo: function(num) {
        num = num || this.get('fragmentNum');

        var containerEl = this._cintainerEl;
        var slideItemEls = this.get('slideItemEls');
        var slideItemWidth;

        var leftMoveNum = this._leftMoveNum;

        // this.fragmentNum = Math.min(num, slideItemEls && slideItemEls.length || 0);
        this.fragmentNum = this.fragmentNum || num;

        if (containerEl && containerEl.length) {
            slideItemWidth = containerEl.width() / num;

            // 设置每个片断的宽度
            this.set('slideItemWidth', slideItemWidth);

            if (slideItemEls && slideItemEls.length) {
                // 设置每个片断的宽度
                slideItemEls.css({
                    width: slideItemWidth + 'px'
                });

                // 设置移动元素的宽度
                this._moveEl.css({
                    width: slideItemEls.length * slideItemWidth + 2 * slideItemEls.length + 'px',
                    visibility: 'visible',
                    left: -slideItemWidth * leftMoveNum * this.fragmentNum + 'px'
                });

                // 设置总的宽度
                this.set('totalLength', slideItemWidth * slideItemEls.length);
            }
        }
    },

    _resize: function() {
        $(window).resize(this._resizeFunc.bind(this));
    },

    _resizeFunc: function() {
        if (this._resizeId) {
            clearTimeout(this._resizeId);
        }

        this._resizeId = setTimeout(this._setBaseInfo.bind(this), 16);
    }
});
