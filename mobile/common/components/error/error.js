var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var Handlebars = require('alpha-handlebars/handlebars');
var IScroll = require("/mobile/common/components/iscroll/iscroll");

var Index = Widget.extend({
	setup: function(){
		Index.superclass.setup.call(this);
	}
});


module.exports = Index;
