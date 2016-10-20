{{#each data.items}}
<div class="util-clearfix" id="{{id}}" data-role="one-compnay" watch="no">
    <div class="user-list util-clearfix">
        <div class="img-wrapper">
            <div class="img-inner-wrapper">
                <a href="#" target="_self">
                    <img src="{{this.logo}}">
                </a>
            </div>
        </div>
        <div class="text-info">
            <div class="compay-name"><a href="//expo.alibaba.com/company.htm?id={{id}}">{{this.name}}</a>
            </div>
            <div class="attribute">{{this.addressCountryName}} {{#if this.hasConnect}}| Connected{{/if}} | Booth:{{this.booth}}</div>
        </div>
    </div>
    <div class="des util-clearfix"><b>Main Products:</b> {{showMainProduct this.mainProducts}}
    </div>
    <div class="imglist util-clearfix">
        <div class="item">
            <div class="img-wrapper">
                <div class="img-inner-wrapper">
                    <a href="//expo.alibaba.com/company.htm?id={{id}}" target="_self">
                        <img src="{{getArrayData this.picList 0}}">
                    </a>
                </div>
            </div>
        </div>
        <div class="item">
            <div class="img-wrapper">
                <div class="img-inner-wrapper">
                    <a href="//expo.alibaba.com/company.htm?id={{id}}" target="_self">
                        <img src="{{getArrayData this.picList 1}}">
                    </a>
                </div>
            </div>
        </div>
        <div class="item">
            <div class="img-wrapper">
                <div class="img-inner-wrapper">
                    <a href="//expo.alibaba.com/company.htm?id={{id}}" target="_self">
                        <img src="{{getArrayData this.picList 2}}">
                    </a>
                </div>
            </div>
        </div>
    </div>
    <div class="action util-clearfix">
        <ul>
<!--            <li>
                <a href="javascript:void(0);" class="the-heart" target="_self" data-role="add-watch-list">Add To Watch List</a>
            </li>-->
            <li class="bule">
                <a href="//expo.alibaba.com/company.htm?id={{id}}" target="_self">View More</a>
            </li>
        </ul>
    </div>
</div>
{{/each}}