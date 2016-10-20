var $ = require('alpha-jquery/jquery');
var movingBoxes = {
    setup: function() {
        this._initElements();
        this._initSlideBox();
        this.events();
    },
    events: function() {
        var _self = this;
        $('#left-button').on('click', function(ev) {
            _self._slideRight(ev);
        });
        $('#right-button').on('click', function(ev) {
            _self._slideLeft(ev);
        });
    },
    _slideLeft: function(ev) {
        var _self = this;
        var el = $(ev.currentTarget);

        if (this.slideItem.length <= (this.offset + 3)) {
            el.addClass("notuse");
            return false;
        } else {
            this.rightbutton.removeClass("notuse");
            this.slideBox.animate({
                left: _self.slideBox.position().left - _self.slideWidth
            }, 300);
            this.slideItem.eq(_self.offset + 1).animate({
                width: 300,
                height: 200,
                opacity: 0.7,
                marginTop: 27
            }, 300);
            //this.slideItem.eq(_self.offset + 1).removeClass("current");
            this.slideItem.eq(_self.offset + 2).animate({
                width: 380,
                height: 254,
                opacity: 1,
                marginTop: 0
            }, 300);
            //this.slideItem.eq(_self.offset + 2).addClass("current");
            //this.slideItem.eq(_self.offset + 1).removeClass("current");
            //this.slideItem.eq(_self.offset).removeClass("current");
            this.offset++;
        }
    },
    _slideRight: function(ev) {
        var _self = this;
        var el = $(ev.currentTarget);
        if (this.offset == 0) {
            el.addClass("notuse");
            return false;
        } else {
            this.leftButton.removeClass("notuse");
            this.slideBox.animate({
                left: _self.slideBox.position().left + _self.slideWidth
            }, 300);

            this.slideItem.eq(_self.offset + 1).animate({
                width: 300,
                height: 200,
                opacity: 0.7,
                marginTop: 27
            }, 300);

            this.slideItem.eq(_self.offset).animate({
                width: 380,
                height: 254,
                opacity: 1,
                marginTop: 0
            }, 300);
            //this.slideItem.eq(_self.offset + 1).addClass("current");

            //this.slideItem.eq(_self.offset).removeClass("current");
            this.offset--;
        }
    },
    _initElements: function() {
        this.slideBox = $('#slide-box');
        this.leftButton = $('#left-button');
        this.rightbutton = $('#right-button');
        this.slideItem = this.slideBox.find('li');
        this.offset = 0;
    },
    _initSlideBox: function() {
        var _width = 0;
        this.slideItem.removeClass('active');
        this.slideItem.eq(1).addClass('active');

        this.slideItem.each(function() {
            _width += $(this).width() + 16;
        });
        this.slideBox.width(_width);
        this.slideWidth = this.slideItem.eq(0).width() + 16;
    }
};
module.exports = movingBoxes;
