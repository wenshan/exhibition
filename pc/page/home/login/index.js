var $ = require('alpha-jquery/jquery');
var Widget = require('alpha-widget/widget');

var store = require('alpha-store/store');

var MessageTip = require('scc-bp-message-tip/message-tip');

var rsa = require('./lib/rsa.js');
var whiteList = require('./lib/white-list.js');

var $$;



var Login = Widget.extend({
    setup: function() {
        this.constructor.superclass.setup.call(this);

        $$ = this;
        this._initElements();
        this._getToUrl();
    },
    events: {
        'click #login-submit': '_login',
        'keyup #login-password': '_loginEnter',
        'keyup #login-name': '_loginEnter'
    },
    attrs: {
        'loginUrl': '/login/login.do'
    },

    _loginEnter: function(e) {
        if (e.keyCode == 13) {
            this._login();
        }
    },
    _login: function() {
        var _self = this;
        this.password = $('#login-password').val();
        this.email = $('#login-name').val();
        this._getRsaKey();
        if (!this.email) {
            MessageTip.error('Please Enter Your Email');
        } else if (!this.password) {
            MessageTip.error('Please Enter Your Password');
        } else {
            $.ajax({
                url: this.get('loginUrl'),
                type: 'POST',
                dataType: 'json',
                data: {
                    email: this.email,
                    password: this.result
                },
                success: function(res) {
                    store.set('__userName', _self.email);

                    if (res.code == 200) {
                        window.location.href = _self.toUrl;
                    } else {
                        MessageTip.error(res.errorMsg);
                    }
                }
            });
        }


    },
    _initElements: function() {
        this.rsakey = 'F58135527E1A720F42D5C56F6DC9E71B59E832F1CB76DF04D8F33FA5355AA5960E1690BB9A98876FB56C29817996A60DD17884A114AAFCA20696B2AC24FBCBA56FD1EAF32D7FC55140EF58F6B16B8753D605D7514B40AE277F5D95C30FF81FF44F476DEFCD542D8B49887770D721557D1B5CF2F115F6C206AB27ECC6DE2F9DDB';
        this.RSA = new rsa();

        var userName = store.get('__userName');
        if (userName) {
            $('#login-name').val(userName);
        }
    },
    _getRsaKey: function() {
        var _self = this;

        this.RSA.setPublic(_self.rsakey, '10001');
        this.result = this.RSA.linebrk(_self.RSA.encrypt(_self.password));
    },
    _getToUrl: function() {
        var _currentSearch = decodeURIComponent(window.location.search);
        var _cacheUrl = _currentSearch.split('=');
        if (!_currentSearch) {
            this.toUrl = '/dashboard/home/index.htm';
        } else {
            _cacheUrl = (_cacheUrl[1] || '').split('//');
            _cacheUrl = _cacheUrl[1] || _cacheUrl[0];
            _cacheUrl = _cacheUrl.split('?')[0].split('#')[0].split(location.hostname)[1];

            if (~$.inArray(_cacheUrl, whiteList)) {
                _currentSearch = _currentSearch.substring(1);
                this.toUrl = _currentSearch.substring(_currentSearch.indexOf('=') + 1);
            } else {
                this.toUrl = '/dashboard/home/index.htm';
            }
        }
    }

});


module.exports = Login;
