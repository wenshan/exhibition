var store = require('alpha-store/store');

module.exports = {
    __cbName: '_cbBeforeLogin',

    setLoginedCb: function(fnName) {
        // 设置的回调函数无法传参
        fnName && store.set(this.__cbName, fnName);
    },

    _checkHasCb: function() {
        var cbFunc = store.get(this.__cbName);

        cbFunc && store.remove(this.__cbName);

        // cbFunc && (cbFunc in this) && this[cbFunc]();
    }
};
