{{#each items}}
<li class="eh-item" data-role="exhibition" data-val="{{id}}">
    <a class="eh-item-header" href="/exhibitiondetail.htm?exhibitionId={{id}}">
        {{#if isExpired}}
        <div class="eh-expired">(Event has ended)</div>
        {{/if}}
        <div class="eh-date">
            {{showDate startTime}} - {{showDate endTime}}
        </div>
        <div class="eh-title">{{name}}</div>
    </a>
    <div class="eh-item-footer">
        <ul class="eh-footer-list" data-role="exhibition-list"  data-val="{{id}}">
            <li class="eh-loading-helper" data-role="list-loading-helper">
                <span class="eh-loading-pic"></span><span class="eh-loading-text">Loading......</span>
            </li>
        </ul>
    </div>
</li>
{{/each}}
