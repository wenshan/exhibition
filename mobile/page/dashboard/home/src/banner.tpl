<div class="eh-dashborad-index-userphoto">
{{#if data.userPhoto}}
	<img src="{{data.userPhoto}}">
{{else}}
	{{photoLetter data.userName}}
{{/if}}
</div>
<div class="eh-dashborad-index-username">{{data.userName}}</div>
<div class="eh-dashborad-index-userposition">{{data.position}}</div>