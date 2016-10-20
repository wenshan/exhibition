var $ = require('alpha-jquery/jquery');
var Widget = require('../../../common/js/widget');

var Index = Widget.extend({
	setup: function(){
		this.constructor.superclass.setup.call(this);

	},
	events:
	{
		'hover [data-role="part-4-tab-list"] li': '_part4Tab',
		'click #index-search-button': '_toSearch',
		'keyup #index-search-input': '_toKeyDownTurn',
		'hover .js-hover-item-image': '_hoverMan',
		'click .part-2-left': '_turnToExhibitionList'
	},
	_turnToExhibitionList: function(){
		window.location.href = '/exhibitiondetail.htm?exhibitionId=10000';
	},
	_hoverMan: function(e){
		var _target = $(e.target);
		var type = _target.attr('type');

		var oLeft = _target.position().left;
		var oTop = _target.position().top;

		$('.js-hover-content').hide();
		$('.js-hover-content[type=' + type + ']').show();

		$('[type="border"]').animate({
			left: oLeft-8,
			top: oTop-8
		},100);
	},
	_part4Tab: function(e)
	{
		var _target = $(e.target);
		_target = _target.attr('tab')?_target:_target.parents('[tab]');
		var _tabType = _target.attr('tab');
		$('[data-role="part-4-tab-list"]').find('li').removeClass('eh-index-part-4-solution-item-active');
		_target.addClass('eh-index-part-4-solution-item-active');
		$('.js-eh-index-tab').hide();
		$('.js-eh-index-tab[tab="' + _tabType + '"]').show();
	},
	_toSearch: function()
	{
		var content = $('#index-search-input').val();
		window.location.href = '/company/search?q=' + content;
	},
	_toKeyDownTurn: function(e){

		if(e.keyCode == 13)
		{
			this._toSearch();
		}
	}
});

module.exports = Index;