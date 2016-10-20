var $ = require('/mobile/common/zepto/zepto');
var extraParams = window.BP.EXTRA_PARAMS;
var serverFailure = 'An error occured.';
var modals = require('/mobile/common/components/zepto-modals/modals');

var whiteList = [
    '/dashboard/ajax/user/detail.do',
    '/dashboard/ajax/watch/WatchCompanyList.do',
    '/dashboard/ajax/connect/connectCompanyList.do',
    '/ajax/exhibition/ExhibitorWithInformList.do',
    '/dashboard/ajax/connect/connectUserList.do'
];

module.exports = {
    send: function(config) {
        // csrf token param
        extraParams = extraParams || this.get('extraParams');

        config = config || {};

        var deferred = $.Deferred();

        var ajax = $.ajax({
            url: mixCsrfToken(config.url),
            type: config.type || 'POST',
            dataType: config.dataType || 'json',
            data: convertData(config),
            cache: false,
            timeout: 5000
        }).done(function(returnData, textStatus, jqXHR) {
            if (!returnData) {
                returnData = {
                    errorMsg: serverFailure,
                    status: false
                };
            }

            if (returnData.status || /^200$/.test(returnData.code) || /^0$/.test(returnData.errorCode)) {
                if (config.onSuccess) {
                    config.onSuccess.bind(this)(returnData, config.data);
                }

                deferred.resolve(returnData);
            } else {
                // TIP: 处理会话失效的情况。
                if (returnData.errorMsg == 'session_expire') {
                    // 会话失效处理
                    deferred.reject();
                    return;
                }

                if (typeof returnData.errorMsg == 'undefined' || returnData.errorMsg == '') {
                    returnData.errorMsg = serverFailure;
                }

                if (config.onFailure) {
                    config.onFailure.bind(this)(returnData);
                }

                if (/^300$/.test(returnData.code)) {

                    if ($.inArray(config.url, whiteList) == -1) {
                        location.href = '/login.htm?toUrl=' + window.location.href;
                    }

                    deferred.reject(returnData);

                    return;
                }

                if (!config.disableTip) {
                    $.toast(returnData.errorMsg);
                }

                deferred.reject(returnData);
            }
        }.bind(this)).fail(function(jqXHR, textStatus, errorThrown) {
            if (textStatus == 'abort') {
                // 忽略
                return;
            }

            var disableTip = config.disableTip,
                errorMessage = '';

            switch (jqXHR.status) {
                case 0:
                    // 已知 About 或 window unload 两种情况
                    disableTip = true;
                    break;
                case 404:
                    // Not Found
                    errorMessage = serverFailure;
                    break;
                case 500:
                    // Server Error
                    errorMessage = serverFailure;
                    break;
                default:
                    errorMessage = serverFailure;
            }

            if (config.onFailure) {
                config.onFailure.bind(this)({
                    errorMsg: errorMessage,
                    status: false
                });
            }

            if (!disableTip) {
                $.toast(errorMessage);
            }

            deferred.reject({
                errorMsg: errorMessage,
                status: false
            });
        }.bind(this)).always(function(jqXHR, textStatus) {
            config.showPreloader && $.hidePreloader();

            if (config.onComplete) {
                config.onComplete.bind(this)({
                    jqXHR: jqXHR,
                    textStatus: textStatus
                });
            }

            deferred.always({
                jqXHR: jqXHR,
                textStatus: textStatus
            });
        }.bind(this));

        var promise = deferred.promise();

        promise.abort = ajax.abort.bind(ajax);

        return promise;
    }
};

// ==== helper ====
function convertData(config) {

    var postData = $.extend(config.data || {}, extraParams);

    return postData;
}

function mixCsrfToken(url) {
    var cookie = document.cookie;
    var match = cookie && cookie.match(/(?:^|;)\s*xman_us_t\s*=\s*([^;]+)/);

    if (match) {
        match = match[1].match(/(?:^|&)\s*ctoken\s*=\s*([^&]+)/);
    }
    var csrf_token = window['_intl_csrf_token_'] || (match && match[1]);

    if (csrf_token && /(\?|&)ctoken=/.test(url) === false) {
        url += (/\?/.test(url) ? '&' : '?') + 'ctoken=' + csrf_token;
    }

    return url;
}
