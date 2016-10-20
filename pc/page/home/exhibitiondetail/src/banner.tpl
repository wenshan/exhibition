<div class="banner-mask">
	<div class="eh-exhibition-detail-time">{{data.exhibitionStartTime}} - {{data.exhibitionEntTime}} </div>
	<div class="logo"></div>
    <div class="eh-index-slogan">{{decode data.exhibitionName}}</div>
	<div class="eh-exhibition-detail-position">
		<span class="eh-exhibition-detail-country"><i class="ui2-icon ui2-icon-map"></i>{{data.exhibitionAddressCity}}, {{data.exhibitionAddressCountry}}</span><span class="eh-exhibition-detail-city">{{data.exhibitorNumber}} {{#equal data.exhibitorNumber 1}}Exhibitor{{else}}Exhibitors{{/equal}}</span><span class="eh-exhibition-detail-exhibitor">{{data.visitorNumber}} {{#equal data.visitorNumber 1}}Visitor{{else}}Visitors{{/equal}} </span>
	</div>
	<div class="eh-exhibition-detail-aciton-box">
		<span class="eh-exhibition-detail-apply" data-role="apply">Register to Visit</span>
		<span class="eh-exhibition-detail-attend" data-role="attend">Become an Exhibitor </span>
	</div>
</div>
<div class="eh-exhibition-detail-tab-box">
<span class="eh-exhibition-tab-one eh-exhibition-tab-one-active" data-role="tab2">General Information</span>
	<span class="eh-exhibition-tab-one" data-role="tab1">Exhibitors List</span>
</div>
