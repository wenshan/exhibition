{{#each data.items}}
<div class="eh-exhibitor-one" userId="{{this.id}}" companyId="{{this.companyId}}" data-role="one-compnay">
	<div class="eh-exhibitor-photo">
	{{#if this.photo}}
		<img src="{{this.photo}}">
	{{else}}
		{{photoLetter this.name}}
	{{/if}}
	</div>
	<div class="eh-exhibitor-name" title="{{this.name}}">{{this.name}}</div>
	<div class="eh-exhibitor-position">{{this.position}}</div>
	<div class="eh-exhibitor-company" title="{{this.companyName}}">
		<a href="javascript:void(0)"  data-role="view-more-information">{{this.companyName}}</a>
	</div>
</div>
{{/each}}