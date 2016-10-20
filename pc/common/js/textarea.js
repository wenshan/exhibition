var $ = require('alpha-jquery/jquery'),
    Widget = require('alpha-widget/widget'),

    TEXTAREA = 'textarea',
    Textarea,

    MAX_LENGTH = 'maxLength',
    AUTO_DBC_TO_SBC = 'autoDbcToSbc',
    REMAINDER = 'remainder',
    LENGTH = 'length',

    CHANGE = 'change',
    INPUT = 'input',
    VALUE = 'value',

    // 对val方法做hook
    hooks = {
        'set': function(element, value) {
            var $element = $(element),
                inc = Textarea.query($element);

            // 赋值
            element.value = value;

            // 为了触发对应的input事件
            if (inc && $element.is(TEXTAREA)) {
                inc.trigger(INPUT);
            }

            // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
            return $element;
        }
    },

    initHooks = function() {
        var valHooks = $.valHooks;

        // 已经存在，保证不出问题，否则直接赋值
        if (valHooks[TEXTAREA]) {
            var _old = valHooks[TEXTAREA];

            valHooks[TEXTAREA] = {
                'set': function(element, value) {
                    // 先调用原来的
                    var ret = _old.set.apply(this, arguments);

                    // 调用当前的
                    hooks.set.apply(this, arguments);

                    // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                    return ret;
                },
                'get': _old.get
            };
        } else {
            valHooks[TEXTAREA] = hooks;
        }

        // 保证只执行一次
        initHooks = function() {};
    },

    /**
     * 全角符号转半角
     *
     * @static
     * @method Textarea.dbcToSbc
     * @param text {String} 需要转的文本
     * @return {String} 全角符号转半角后的字符
     */
    dbcToSbc = function(text) {
        var result = '',
            code,
            i = 0,
            l;

        if (!text) {
            return result;
        }
        l = text.length;
        for (; i < l; i++) {
            code = text.charCodeAt(i);
            if (code >= 65281 && code <= 65374) {
                result += String.fromCharCode(code - 65248);
            } else if (code === 8220 || code === 8221) {
                result += String.fromCharCode(34);
            } else if (code === 8216 || code === 8217) {
                result += String.fromCharCode(39);
            } else if (code === 12288) {
                result += String.fromCharCode(32);
            } else if (code === 12289) {
                result += String.fromCharCode(44);
            } else if (code === 12290) {
                result += String.fromCharCode(46);
            } else if (code === 12304) {
                result += String.fromCharCode(91);
            } else if (code === 12305) {
                result += String.fromCharCode(93);
            } else {
                result += text.charAt(i);
            }
        }
        return result;
    },

    ATTRS = {};

/**
 * textarea的value值
 *
 * @attribute value
 * @type String
 */
ATTRS[VALUE] = {
    // 设置时的一些附加操作
    setter: function(val) {
        // 设置的同时去设置对应的dom的value值
        $(this.get('element')).val(val);

        // 通过this.set('value', xxx)的时候也会触发该事件
        this.trigger(INPUT);

        return val;
    },
    // 取值的时候取的是dom的value值
    getter: function(val) {
        return $(this.get('element')).val();
    }
};

/**
 * textarea的maxlength值
 * -1表示不需要做maxlength的限制
 *
 * @attribute maxLength
 * @type Number
 * @default -1
 */
ATTRS[MAX_LENGTH] = {
    value: -1,
    // 设置的同时去设置对应的dom的maxLength值
    setter: function(val) {
        // 数字化
        val = toNumber(val);

        // 如果不是数字，就设置为返回当前值
        if (!isNumber(val) || val < 0) {
            return this.get(MAX_LENGTH);
        }

        return val;
    }
};

/**
 * 是否将全角符号转换为半角符号
 *
 * @attribute autoDbcToSbc
 * @type Boolean
 * @default true
 * @readOnly
 */
ATTRS[AUTO_DBC_TO_SBC] = {
    readOnly: true,
    value: true
};

/**
 * 显示剩余字数的$对象或选择器
 *
 * @attribute remainder
 * @type Object
 */
ATTRS[REMAINDER] = {
    getter: function(val) {
        return $(val);
    }
};

/**
 * 当前value的长度
 *
 * @attribute length
 * @type Number
 * @readOnly
 */
ATTRS[LENGTH] = {
    readOnly: true,
    getter: function() {
        var val = this.element.val(),
            re = /[^\x00-\xFF]/gi;

        //双字节字符算两个字数
        if (this.get('doubleLength')) {
            val = val.replace(re, 'aaaa');
        }

        // 换行符统一算2字节
        val = val.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

        return val.length;
    }
};

/**
 * 重写template
 *
 * @attribute template
 * @type String
 * @default '<textarea></textarea>'
 */
ATTRS['template'] = {
    value: '<textarea></textarea>'
};


/**
 * 双字节是否算2个长度，默认为false
 *
 * @attribute doubleLength
 * @type Boolean
 * @default false
 */
ATTRS.doubleLength = false;

// 所有初始化过的 Textarea 实例
var cachedInstances = {};

/**
 * Textarea组件
 * <p>
 * 提供各种textarea的常用功能支持<br />
 * 1. maxlength属性的IE兼容支持<br />
 * 2. 自动全角转半角（change时转换），属于语法糖的一种<br />
 * 3. 剩余字数提醒（有输入时就提醒），属于语法糖的一种
 * </p>
 *
 * @class Textarea
 * @extends Widget
 * @constructor
 * @param config {Object} 配置。
 * @param [config.autoDbcToSbc] {Boolean} 是否将全角符号转换为半角符号，默认为true
 * @param [config.remainder] {String|Object} 显示剩余字数的$对象或选择器
 */
Textarea = Widget.extend({

    Statics: {
        dbcToSbc: dbcToSbc,

        query: function(element) {
            var cid = element.attr('data-textarea-cid');

            return cachedInstances[cid];
        }
    },

    attrs: ATTRS,

    events: {
        // change事件
        'change': '_handleChange',

        // input事件
        'keyup': '_handleInput',
        'blur': '_handleInput',
        'paste': '_handleInput',
        'keydown': '_handleInput'
    },

    /**
     * 子类的初始化
     *
     * @method setup
     * @protected
     */
    setup: function() {
        var element = this.element;

        // 如果自动全角转半角，在change的时候去做，语法糖
        if (this.get(AUTO_DBC_TO_SBC)) {
            this.on(CHANGE, function() {
                element.val(dbcToSbc(element.val()));

                //this.set(VALUE, dbcToSbc(this.get(VALUE)));
            });
        }

        if (this.get(MAX_LENGTH) < 0 && this.element.attr(MAX_LENGTH)) {
            this.set(MAX_LENGTH, this.element.attr(MAX_LENGTH));
        }

        // IE10 的 IE7 兼容模式下会有问题
        try {
            this.element.attr(MAX_LENGTH, '');
        } catch (e) {}

        // 如果剩余字数提醒，在input的时候去做，语法糖
        this.on(INPUT, this._setRemainder);

        // stamp
        var cid = this.tcid = uniqueCid();
        this.element.attr('data-textarea-cid', cid);
        cachedInstances[cid] = this;

        // 加入hooks
        initHooks();
    },

    /**
     * 生成dom结构和样式并插入文档流。
     *
     * @method parseElement
     * @protected
     */
    parseElement: function() {
        Textarea.superclass.parseElement.call(this);

        // 标签不符合，抛错
        if (!this.element.is(TEXTAREA)) {
            throw new Error('element is not textarea');
        }
    },

    /**
     * 生成dom结构和样式并插入文档流。
     *
     * @method render
     * @public
     */
    render: function() {
        // 让用户传入的 config 生效并插入到文档流中
        Textarea.superclass.render.call(this);

        // 显示一次剩余值
        this._setRemainder();

        return this;
    },

    _onRenderMaxLength: function() {
        this._setRemainder();
    },

    /**
     * change事件的handle
     *
     * @method _handleChange
     * @param ev {Object} 事件参数
     * @private
     */
    _handleChange: function(ev) {
        /**
         * 当textarea的change事件触发的时候触发
         *
         * @event change
         */
        this.trigger(CHANGE);
    },

    /**
     * input事件的handle
     *
     * @method _handleInput
     * @param ev {Object} 事件参数
     * @private
     */
    _handleInput: function(ev) {
        /**
         * 当textarea有输入时（键盘输入或粘贴）时触发，通过this.set('value', xxx)的时候也会触发
         *
         * @event input
         */
        this.trigger(INPUT);
    },

    //--------------对外接口


    //--------------内部帮助方法
    /**
     * 设置remainder的值
     *
     * @method _setRemainder
     * @private
     */
    _setRemainder: function() {
        var remainder = this.get(REMAINDER),
            maxLength = this.get(MAX_LENGTH);

        if (remainder && maxLength > 0) {
            this.get(REMAINDER).html(maxLength - this.get(LENGTH));
        }
    },

    destroy: function() {
        delete cachedInstances[this.tcid];
        Textarea.superclass.destroy.call(this);
    }

});

module.exports = Textarea;

//--------------------helper-------------------//
/**
 * 转换为Number
 *
 * @static
 * @method toNumber
 * @param v {String|Number} 输入
 * @return {Number} 转换好的Number类型
 */
function toNumber(v) {
    return parseInt(v, 10);
}

// 是否是数字
function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

var cidCounter = 0;

function uniqueCid() {
    return 'textarea-' + cidCounter++;
}
