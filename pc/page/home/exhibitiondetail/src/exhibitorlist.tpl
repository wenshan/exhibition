 {{#each data.items}}
<div class="eh-exdtail-part-3-one-item" companyid="{{this.id}}" data-role="one-compnay" watch="no">
	<div class="eh-exdtail-part-3-item-top">
		<div class="eh-exdtail-part-3-item-image">
			<img src="{{this.logo}}">
		</div>
		<div class="eh-exdtail-part-3-item-info">
			<div class="eh-exdtail-part-3-item-name" title="{{this.name}}" data-role="view-more-information">{{this.name}}</div>
			<div class="eh-exdtail-part-3-item-informatino">{{this.addressCountryName}} {{#if this.mainProducts}} | <span title="{{showMainProduct this.mainProducts}}">{{showMainProduct this.mainProducts}}</span>{{/if}}</div>
		</div>
		<div style="clear: both;"></div>
		<div class="eh-exdtail-part-3-item-location" title="{{this.booth}}">Booth:{{this.booth}} {{#if this.hasConnect}} | <span class="connected-before-icon"></span>   Connected {{/if}}
		</div>
	</div>
	<div class="eh-exdtail-part-3-item-middle">
		<div class="eh-exdtail-part-3-showpicleft">
			<img src="{{getArrayData this.picList 0}}">
		</div>
		<div class="eh-exdtail-part-3-showpicright">
			<div class="image-wrap"><img src="{{getArrayData this.picList 1}}"></div>
			<div class="image-wrap"><img src="{{getArrayData this.picList 2}}"></div>
		</div>
	</div>
	<div class="eh-exdtail-part-3-item-bottom">
		<span class="connected-before" data-role="add-watch-list"><span class="the-heart {{#if this.hasWatch}}active{{/if}}"></span>Add to Watch List</span>
		<span class="view-more" data-role="view-more-information">View More</span>
	</div>
</div>
{{/each}}
