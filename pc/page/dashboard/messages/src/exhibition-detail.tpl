<section class="eh-date">{{startTime}} - {{endTime}}</section>
{{#if isExpired}}
<div class="eh-overdue">Event has ended</div>
{{/if}}
<header class="eh-content-header" title="{{name}}">{{name}}</header>
<ul class="eh-company-info">
    <li class="eh-company-info-item">
        <span class="eh-info-item-left">
            Location:
        </span><span class="eh-info-item-right eh-location">
            {{city}}, {{country}}
        </span>
    </li>
    <li class="eh-company-info-item">
        <span class="eh-info-item-left">
            Product Categories:
        </span><span class="eh-info-item-right" title="{{showCatList industryList}}">
            {{showCatList industryList}}
        </span>
    </li>
    <li class="eh-company-info-item">
        <span class="eh-info-item-left">
            Participants:
        </span><span class="eh-info-item-right">
            <strong>{{showNum exhibitorNumber}}</strong> {{showExhibitions exhibitorNumber}} | <strong>{{showNum visitorNumber}}</strong> {{showVistors visitorNumber}}
        </span>
    </li>
</ul>

<div class="eh-opt-btn-area">
    <a href="/exhibitiondetail.htm?exhibitionId={{id}}" data-id="{{id}}" class="ui2-button ui2-button-default ui2-button-normal ui2-button-medium">View this Event</a>
</div>
