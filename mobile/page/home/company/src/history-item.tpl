{{#each historicalExhibitions}}
<li class="eh-history-item">
    <a  href="/exhibitiondetail.htm?exhibitionId={{id}}" class="eh-history-item-inner">
        <section class="eh-left">
            <div class="eh-pic" style="background-image: url({{logo}});">
            </div>
            <div class="eh-line"></div>
        </section>

        <section class="eh-right">
            <div class="eh-right-inner">
                <span class="eh-arrow"></span>
                <div class="eh-date">{{showDate startTime}} — {{showDate endTime}}</div>
                <header class="eh-title">{{name}}</header>
            </div>
        </section>
    </a>
</li>
{{/each}}
