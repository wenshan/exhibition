{{#each items}}
<li class="eh-exhibition-item">
    <div class="eh-scedule-content">
        <header class="eh-scedule-date">{{dateExec startTime}} - {{dateExec endTime}}</header>
        <div class="eh-scedule-detail">
            {{#if isExpired}}
            <div class="eh-overdue">Event has ended</div>
            {{/if}}
            <a class="eh-scedule-detail-title" title="{{name}}" href="/exhibitiondetail.htm?exhibitionId={{id}}">
                <span class="eh-title-big" title="{{name}}">{{name}}</span><!--<span class="eh-title-middle">(MATERLALS MANUFACRING & TECHNOY)</span>-->
            </a>
            <ul class="eh-info-list">
                <li class="eh-info-item">
                    <span class="eh-info-item-title">Location :</span><span class="eh-info-item-content eh-location">
                        {{city}}, {{countryName}}
                    </span>
                </li>
                <li class="eh-info-item">
                    <span class="eh-info-item-title">Product Categories :</span><span class="eh-info-item-content">
                        {{product industryList}}
                    </span>
                </li>
                <li class="eh-info-item">
                    <span class="eh-info-item-title">Participants :</span><span class="eh-info-item-content">
                        <span class="eh-link-small">{{numberShow exhibitorNumber}}</span> {{showExhibitors exhibitorNumber}} | <span class="eh-link-small">{{numberShow visitorNumber}}</span> {{showvVisitors visitorNumber}}
                    </span>
                </li>
            </ul>
            <ul class="eh-exhibition-photos">
                {{picListRender picList}}
            </ul>
        </div>
    </div>
    <!-- 底边通知人 -->
    <footer class="eh-scedule-footer">
        <ul class="eh-exhibitors-list">
            {{showConnectedList connectUsers participantUsers}}
        </ul>
        <div class="eh-exhibitors-title">
            <span class="eh-exhibitors-num">{{numberShow connectUserNumber}}</span><span class="eh-exhibitors-other" data-role="no-connected-text"> {{showExhibitor connectUsers participantUsers}}</span>
        </div>
    </footer>
</li>
{{/each}}
