
<div class="inform-wrap" userId="{{userId}}" data-role="inform-dialog-box">
    <div class="eh-inform-you-select">
        <span>You've Selected </span>
        <span class="eh-inform-user-photo">
            {{#if userPhoto}}
            <img src="{{userPhoto}}">
            {{else}}
            {{photoLetter userName}}
            {{/if}}
        </span><span class="eh-inform-user-name" title="{{decode userName}}">{{decode userName}}</span>
    </div>
    <div class="eh-inform-content">
        <div class="eh-attending-event-box">
            <h1 class="eh-attending-title">Select An Event</h1>
            <div class="eh-attending-wrap">
                <div class="eh-attending-list-left-btn" data-role="slide-button" direction="left">
                    <span class="eh-attending-list-left-btn-icon" direction="left"></span>
                </div>
                <div class="eh-attending-list-wrap">
                    <ul class="eh-attending-list" data-role="slide-list">
                        {{#each items}}
                        <li class="eh-attending-item" data-role="slide-item" exhibationId="{{this.id}}">
                            <div class="eh-attending-time">
                                {{this.startTime}}~{{this.endTime}}
                            </div>
                            <p class="eh-attending-name">{{this.name}}</p>
                            <div class="eh-attending-triangle-wrap">
                                <i class="ui2-icon ui2-icon-selected"></i>
                                <span class="eh-attending-triangle"></span>
                            </div>
                        </li>
                        {{/each}}
                    </ul>
                </div>
                <div class="eh-attending-list-right-btn" data-role="slide-button" direction="right">
                    <span class="eh-attending-list-right-btn-icon" direction="right"></span>
                </div>
            </div>
            <h1 class="eh-attending-title">Message<span></span></h1>
            <div class="eh-attending-input-box">
                <textarea class="eh-attending-textarea" data-role="eh-inform-textarea" maxlength="300"></textarea>
                <div class="eh-attending-left-word">
                    <span data-role="remain-word"></span>left
                </div>
            </div>
        </div>
    </div>
</div>
