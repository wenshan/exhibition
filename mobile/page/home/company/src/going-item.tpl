{{#each ongoingExhibitions}}
<li class="eh-going-item">
    <section class="eh-left">
        <div class="eh-photo">
            <image src="{{logo}}" />
        </div>
        <div class="eh-line"></div>
    </section>
    <section class="eh-right">
        <a href="/exhibitiondetail.htm?exhibitionId={{id}}" class="eh-right-inner">
            <div class="eh-date">{{showDate startTime}} — {{showDate endTime}}</div>
            <div class="eh-footer-outer">
                {{#if sideViewImg}}
                <header class="eh-header-pic" style="background-image: url({{sideViewImg}});">
                    <span class="eh-arrow"></span>
                </header>
                {{/if}}
                <div class="eh-title">{{name}}</div>
                <div class="eh-location">
                    <span class="eh-location-title">Booth : </span><span>{{showLocation boothRecordInfo}}</span>
                </div>
                <div class="eh-detail eh-company-des">
                {{description}}
                </div>
            </div>
        </a>
    </section>
</li>
{{/each}}
