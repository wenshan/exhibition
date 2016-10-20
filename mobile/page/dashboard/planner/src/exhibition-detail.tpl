<li class="eh-item" data-role="eh-item">
    <header class="eh-date">{{showDate origin.startTime}} - {{showDate origin.endTime}}</header>
    <div class="eh-title">{{exhibitionName}}</div>
    <div class="eh-info-item"><span class="eh-left-title">Location:</span> <span class="eh-content eh-location">{{exhibitionAddressCity}}, {{exhibitionAddressCountry}}</span></div>
    <div class="eh-info-item"><span class="eh-left-title">Industry:</span> <span class="eh-content">{{showIndustries exhibitionIndustry}}</span></div>
    <div class="eh-info-item">
        <span class="eh-left-title">Participants:</span> <span class="eh-content">
            <span>{{showExhNum exhibitorNumber}}</span> | <span>{{showVisitorNum visitorNumber}}</span>
        </span>
    </div>

    <ul class="eh-pics">
        {{showPics picList}}
    </ul>

    <a href="/exhibitiondetail.htm?exhibitionId={{exhibitionId}}" class="eh-view-more">View More</a>
</li>
