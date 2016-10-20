{{#each data.items}}
<div class="connect-man connected-man" data-role="one-man" userId="{{this.userId}}">
	<div class="man-up" data-role="show-more-info">
		<div class="man-photo" data-role="user-photo">
			{{#if this.userPhoto}}
            <img src="{{this.userPhoto}}" >
            {{else}}
            {{photoLetter this.userName}}
            {{/if}}
		</div>
		<div class="man-info-box">
			<div class="man-name" data-role="user-name">{{this.userName}}</div>
			<div class="man-position">{{this.userPosition}}</div>
		</div>
		<span class="man-more-info">...</span>
	</div>
	<div class="man-middle" data-role="show-detail">
		<div class="man-company" data-role="company-name" companyId="{{this.companyId}}">{{this.companyName}}</div>
		<div class="info-title">Main Products: </div>
		<div class="info-detail">{{showMainProduct this.companyMainProducts}}</div>
		<div class="info-title remark-title" data-role="ramark-button">Remark<span class="remark-icon"></span></div>
		<div class="remark-detail" data-role="user-comment">{{this.comment}}</div>
	</div>
	<div class="man-down">
		<div class="inform-button" data-role="inform-button">Inform</div>
	</div>
</div>
{{/each}}