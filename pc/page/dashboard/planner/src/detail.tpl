<div class="eh-scedule-content">
    <!--<header class="eh-scedule-date"> {{dateExec startTime}} - {{dateExec endTime}}</header>-->
    <div class="eh-scedule-detail">
        <a class="eh-scedule-detail-title" title="{{exhibitionName}}" href="/exhibitiondetail.htm?exhibitionId={{exhibitionId}}">
            <span class="eh-title-big">{{exhibitionName}}</span>
        </a>
        <ul class="eh-info-list">
            <li class="eh-info-item">
                <span class="eh-info-item-title">Location :</span><span class="eh-info-item-content eh-location">
                    {{exhibitionAddressCity}}, {{exhibitionAddressCountry}}
                </span>
            </li>
            <li class="eh-info-item eh-main-products" title="{{product exhibitionIndustry}}">
                <span class="eh-info-item-title">Product Categories :</span><span class="eh-info-item-content">
                    {{product exhibitionIndustry}}
                </span>
            </li>
            <li class="eh-info-item">
                <span class="eh-info-item-title">Participants :</span><span class="eh-info-item-content">
                    <strong class="eh-link-small">{{showNumExh exhibitorNumber}}</strong> | <strong class="eh-link-small">{{showNumVis visitorNumber}}</strong>
                </span>
            </li>
        </ul>
        <ul class="eh-exhibition-photos">
            {{picListRender picList}}
        </ul>
        <a target="_blank" href="/exhibitiondetail.htm?exhibitionId={{exhibitionId}}" class="ui2-button ui2-button-default ui2-button-normal ui2-button-medium">View More</a>
    </div>
</div>
