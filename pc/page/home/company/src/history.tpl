{{#each historicalExhibitions}}
<li class="eh-history-item">
    <div class="eh-history-item-inner">
        <div class="eh-left-image">
            <div class="eh-left-image-inner">
                <image src="{{logo}}">
            </div>
        </div>
        <ul class="eh-right-content">
            <li class="eh-right-content-item eh-title" data-role="history-title" title="{{name}}">{{name}}</li>
            <li class="eh-tight-content-item eh-date">{{showDate startTime}} - {{showDate endTime}}</li>
        </ul>
    </div>
</li>
{{/each}}
