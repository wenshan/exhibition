var map = {
    "en-us": "en-us",
    "zh-cn": "zh-cn",
    "zh-tw": "zh-tw"
};

var i18n = {
    "en-us": {
        'loadingText': 'Loading, please wait ...'
    },
    "zh-cn": {
        'loadingText': '正在加载，请稍候...'
    },
    "zh-tw": {
        'loadingText': '正在加載，請稍作等待...'
    }
};

function _(locale) {
    var r = i18n[map[locale] || 'en-us'];
    r._ = _;
    return r;
}
try {
    var locale = seajs.data.vars.locale;
} catch (e) {
    var locale = 'en-us';
}
module.exports = _(locale);
