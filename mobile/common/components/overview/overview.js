var $ = require("/mobile/common/zepto/zepto");
var Widget = require("/mobile/common/widget");
var Overview = Widget.extend({
	attrs:{
		element:"#overview",
		moreClass:"more",
		lessClass:"less",
		scrollHeigt:56
	},
	setup: function (config) {
		Overview.superclass.setup.call(this, config);
		this._events();
	},
	_events: function () {
		var _self = this;
		var text = this.element.find(".text");
		var node = this.element.find(".view-all");
		node.on("tap", function(){
			var currentHeight = $(text).css("height");
			if($(this).hasClass(_self.get("moreClass"))){
				$(this).removeClass(_self.get("moreClass"));
				$(this).addClass(_self.get("lessClass"));
				$(text).animate({height:"auto"},500);
			}else {
				$(this).removeClass(_self.get("lessClass"));
				$(this).addClass(_self.get("moreClass"));
				$(text).animate({height:_self.get("scrollHeight")},500);
			}

		});
	}
});
module.exports = Overview;
