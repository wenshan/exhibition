/**
 * 账户信息渲染
 */

var $ = require('alpha-jquery/jquery');

module.exports = {
    _renderAccountInfo: function() {
        var $$ = this.$.bind(this);

        this._accountInfoPromise = this.send({
            url: '/dashboard/ajax/user/detail.do'
        }).then(function(returnData) {
            returnData = returnData.data;

            // 三个通知
            $.each(['watchNumber', 'connectNumber', 'informNumber'], function(index, item) {
                $$('[data-role="' + item + '"]').text(returnData[item]);
            });

            // 人员信息显示
            $$('[data-role="user-name"]').text(returnData.userName).prop('title', returnData.userName);
            // 显示人员职位信息
            $$('[data-role="user-career"]').text(returnData.position);


            $$('[data-role="search-user-name"]').text(returnData.userName).attr('title', returnData.userName);

            // 头像显示
            var photoEl = $$('[data-role="person-photo"]');

            if (returnData.userPhoto) {
                photoEl.css({
                    'background-image': 'url(' + returnData.userPhoto + ')'
                });

                // 右上角头像
                $$('[data-role="search-user-photo"]').css({
                    'background-image': 'url(' + returnData.userPhoto + ')'
                });
            } else {
                var nameFirstText = returnData.userName.charAt(0).toUpperCase();
                photoEl.text(nameFirstText);

                $$('[data-role="search-user-photo"]').text(nameFirstText);
            }

            this.trigger('accountRendered', returnData);

            return returnData;
        }.bind(this), function(returnData){
            this.trigger('accountRendered', returnData);
        }.bind(this));
    }
};
