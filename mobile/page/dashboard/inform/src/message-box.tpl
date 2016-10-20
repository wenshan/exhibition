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
	<span class="eh-m-inform-cancel js-back-to-edit" data-role="inform-cancel-button">Cancel</span>
</div>
<div class="eh-m-inform-fillhead"></div>
<div class="back-edit-wrap">
	<span class="event-number">1</span> event selected 	<span class="back-to-edit js-back-to-edit" data-role="back-to-edit">Edit</span> 
</div>
<div class="inform-message-box">
	<div class="inform-message-box-title">Message (optional)</div>
	<div class="inform-message-textarea">
		<textarea data-role="message-textarea" maxlength="300"></textarea>
		<div class="message-left-word"><span id="inform-message-left-word">10 </span>left</div>
	</div>
</div>
<div class="inform-next-button active" data-role="inform-send-button">Send</div>