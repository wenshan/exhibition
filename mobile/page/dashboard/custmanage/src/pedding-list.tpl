{{#each data.items}}
<div class="connect-man" data-role="one-man" userId="{{this.userId}}">
	<div class="man-up">
		<div class="man-photo">
		{{#if this.userPhoto}}
			<img src="{{this.userPhoto}}"/>
		{{else}}
			{{photoLetter this.userName}}
		{{/if}}
		</div>
		<div class="man-info-box">
			<div class="man-name">{{this.userName}}</div>
			<div class="man-position">{{this.userPosition}}</div>
				<div class="man-company" data-role="company-name" companyId="{{this.companyId}}">
					{{this.companyName}}
				</div>
		</div>
	</div>
	<div class="man-down">
		<div class="connect-button accept-button" data-role="pending-btn">Accept</div>
		<div class="connect-button ignore-button" data-role="pending-btn">Ignore</div>
	</div>
</div>
{{/each}}