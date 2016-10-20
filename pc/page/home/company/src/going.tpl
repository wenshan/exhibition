{{#each ongoingExhibitions}}
<li class="eh-going-item" data-role="going-item">
    <!-- 收起 -->
    <div class="eh-shrink eh-dsn" data-role="shrink-par">
        <span class="eh-toggle-btn eh-btn-expand" data-role="expand">d</span>
        <div class="eh-shrink-inner" title="{{name}} ( {{showDate startTime}} — {{showDate endTime}} ) {{city}}, {{country}}">
            <span class="eh-shrink-item eh-title">
                {{name}}
            </span><span class="eh-shrink-item eh-date">
                ( {{showDate startTime}} - {{showDate endTime}} )
            </span><span class="eh-shrink-item eh-detail">
                {{city}}, {{countryName}}
            </span>
        </div>

    </div>
    <!-- 展开 -->
    <div class="eh-expanded" data-role="expand-par">
        <div class="eh-expanded-inner">
            <span class="eh-toggle-btn eh-btn-shrink" data-role="shrink">c</span>
            <section class="eh-left-image">
                <div class="eh-pic">
                    <image src="{{logo}}">
                </div>
            </section>
            <ul class="eh-exh-detail-list">
                <li class="eh-date">{{showDate startTime}} - {{showDate endTime}}</li>
                <li class="eh-title" data-role="resize-title" title="{{name}}">{{name}}</li>
                <li class="eh-location">
                    <span class="eh-title">Booth :</span><span class="eh-content"> {{showLocation boothRecordInfo}}</span>
                </li>
                <li class="eh-detail">{{description}}</li>
                <li class="eh-view-more">
                    <a href="/exhibitiondetail.htm?exhibitionId={{id}}">View More ></a>
                </li>
            </ul>
        </div>
    </div>
</li>
{{/each}}
