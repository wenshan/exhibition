var $ = require('/mobile/common/zepto/zepto');
var Widget = require('/mobile/common/widget');
var Handlebars = require('alpha-handlebars/handlebars');
var IScroll = require("/mobile/common/components/iscroll/iscroll");

var Index = Widget.extend({
	setup: function(){
		Index.superclass.setup.call(this);

		this._initElement();
		this._initScroll();
        this.initGoTop();
	},
	events:{
		'touchend .eh-m-index-slide-item a': '_turnToCompany',
		'touchmove .eh-m-index-slide-item a': '_moveBanner',
		'click .js-nav-list-item': '_hoverImage'
	},
	_hoverImage: function(e){
		var _target = $(e.target);
		_target = _target.attr('type')?_target:_target.parents('.js-nav-list-item');

		var type = _target.attr('type');

		$('.js-nav-list-item').removeClass('active');
		_target.addClass('active');
		$('.js-content-list-item').hide();
		$('.js-content-list-item[type="' + type + '"]').show();
	},
	_turnToCompany: function(e){
		var _url = $(e.target).parent('a').attr('href');
		if(this.moving == false)
		{
			window.location.href = _url;
		}
	},
	_moveBanner: function(){
		var _self = this;
		_self.moving = true;
		clearTimeout(_self.moveTimer);
		this.moveTimer = setTimeout(function(){
			_self.moving = false;
		},500);
	},
	_initScroll: function(){
		var _self = this;
		this.scroll = new IScroll(".eh-m-index-slide-list-wrap", {
			scrollX: true,
			scrollY: false,
			mouseWheel: true
		});

		this.scroll.on('scrollEnd', function(){
			var oLeft = _self.slideBox.position().left;

			oLeft = Math.abs(oLeft);
			if(oLeft >= 0 && oLeft < _self.slideWidth/2)
			{
				_self.slideButtonItem.removeClass('active');
				_self.slideButtonItem.eq(0).addClass('active');
				_self.slideBox.css({
					'transform': 'translate(' + 0 + 'px, 0px) translateZ(0px);'
				});

			}
			else if(oLeft >= _self.slideWidth/2 && oLeft < _self.slideWidth*1.5)
			{
				_self.slideButtonItem.removeClass('active');
				_self.slideButtonItem.eq(1).addClass('active');
				_self.slideBox.css({
					'transform': 'translate(' + -1*_self.slideWidth + 'px, 0px) translateZ(0px);'
				});
			}
			else
			{
				_self.slideButtonItem.removeClass('active');
				_self.slideButtonItem.eq(2).addClass('active');
				_self.slideBox.css({
					'transform': 'translate(' + -2*_self.slideWidth + 'px, 0px) translateZ(0px);'
				});
			}
		});

		this.slideButtonItem.removeClass('active');
		this.slideButtonItem.eq(0).addClass('active');
	},
	_initElement: function(){
		this.slideButtonWrap = $('.slide-button-list');
		this.slideButtonItem = this.slideButtonWrap.find('li');
		this.slideBox = $('.slide-list-box');
		this.slideItem = this.slideBox.find('.eh-m-index-slide-item');
		this.slideWidth = this.slideItem.width();

		this.moveTimer = null;
		this.moving = false;
	}
});


module.exports = Index;
