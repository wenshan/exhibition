<div class="eh-m-inform-head" id="inform-head">
	<span class="eh-m-inform-title">Inform</span>
	<span class="eh-m-inform-userphoto">
		{{#if data.userPhoto}}
		<img src="{{data.userPhoto}}">
		{{else}}
		{{photoLetter data.userName}}
		{{/if}}
	</span>
	<span class="eh-m-inform-name">{{decode data.userName}}</span>
	<span class="eh-m-inform-cancel" data-role="inform-cancel-button">Cancel</span>
</div>
<div class="eh-m-inform-fillhead"></div>
<div class="eh-m-inform-warning" data-role="warning-box">
	<i class="ui2-icon ui2-icon-notice"></i>
	Note: Each person can only be notified 3 times per event
</div>
<div class="eh-m-inform-list" id="eh-list-wrap">
	<div class="eh-inform-list-title">Select an event</div>

	{{#each data.items}}
	<div class="eh-inform-one-box" data-role="eh-m-one-exhibition-box" ehId="{{this.id}}">
		<div class="eh-inform-time">{{this.startTime}}~{{this.endTime}}</div>
		<div class="eh-inform-name">{{this.name}}</div>
		<div class="eh-attending-triangle-wrap">
            <i class="ui2-icon ui2-icon-selected"></i>
            <span class="eh-attending-triangle"></span>
        </div>
	</div>
	{{/each}}

</div>
<div class="inform-next-button" data-role="inform-next-button">NEXT ></div>