{{#each data.items}}
<div class="exhibition-list-item" ehId="{{this.id}}" data-role="one-exhibition">
    <div class="exhibiton-name">{{this.name}}</div>
    <div class="exhibition-location">
        <i class="ui2-icon ui2-icon-map"></i>
        <span>{{this.city}}, {{this.countryName}}</span>
    </div>
    {{#if this.connectUserNumber}}
    <div class="exhibition-exhibitor-count">
        <i class="ui2-icon ui2-icon-account"></i>
        <span>{{this.connectUserNumber}} {{#compare this.connectUserNumber '==' 1}}Connection{{else}}Connections{{/compare}} participating at this event. </span>
    </div>
    {{/if}}
    <div class="exhibition-time">
        {{this.startTime}} - {{this.endTime}}{{#if this.isExpired}}<span class="exhibiton-isExpired-box"><span class="arrow"></span>Event has ended</span>{{/if}}
    </div>
</div>
{{/each}}
