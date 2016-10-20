{{#each data.items}}
<li>
	<div class="img-wrapper circular">
		<div class="img-inner-wrapper ">
			<a href="//expo.alibaba.com/company.htm?id={{companyId}}" target="_self">
			{{#if this.photo}}
				<img src="{{this.photo}}">
			{{else}}
				{{photoLetter this.name}}
			{{/if}}
			</a>
		</div>
	</div>
	<div class="text-info">
		<p class="title">{{this.name}}</p>

		<p class="c666 position">{{this.position}}</p>

		<p class="canpany-info"><a href="//expo.alibaba.com/company.htm?id={{companyId}}" target="_self">{{this.companyName}}</a></p>
	</div>
</li>
{{/each}}


