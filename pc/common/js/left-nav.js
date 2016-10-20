var $ = require('alpha-jquery/jquery');

module.exports = {
    _leftNavInit: function() {
        var ary = location.pathname.split('/');
        var nav = ary[ary.length - 2];

        this.$('[data-role="left-side"] [data-nav]').removeClass('active');

        this.$('[data-nav="' + nav + '"]').addClass('active');
    }
};
