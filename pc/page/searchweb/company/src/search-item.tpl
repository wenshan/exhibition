{{#each items}}
<li class="eh-list-item" data-href="/company.htm?id={{companyId}}">
    <div class="eh-list-item-sub" data-role="list-item">
        <!-- 左边区域 -->
        <div class="eh-sub-left" data-role="list-item-left">
            <!-- 收藏按钮 -->
            <span class="eh-collection-btn" data-id="{{companyId}}" data-role="collection-btn"></span>
            <a href="/company.htm?id={{companyId}}" title="{{nameShow name ''}}" class="eh-list-item-header">
                <span class="eh-company-name">
                {{nameShow name ''}}
                </span>
            </a>
            <!-- 公司信息部分 -->
            <ul class="eh-company-info">
                <li class="eh-company-info-item">
                    <span class="eh-info-item-left">
                        Location:
                    </span><span class="eh-info-item-right eh-location">
                        {{nameShow addressCity addressCountry}}
                    </span>
                </li>
                <li class="eh-company-info-item">
                    <span class="eh-info-item-left">
                        Main Products:
                    </span><span class="eh-info-item-right" title="{{showEm mainProducts}}">
                        {{showEm mainProducts}}
                    </span>
                </li>
                <li class="eh-company-info-item">
                    <span class="eh-info-item-left">
                        Event History:
                    </span><span class="eh-info-item-right">
                        Has attended {{exhNum historicalExhibitionIds}}
                    </span>
                </li>
                <li class="eh-company-info-item" data-role="exhibition-his-pics">

                </li>
            </ul>

            <div class="eh-conneted-item" data-role="connected">
                <span class="eh-info-item-left">
                    Connection:
                </span><span class="eh-info-item-right" data-compId="{{companyId}}" data-role="connected-res">
                    --
                </span>
            </div>
        </div>
        <!-- 右边图片区域 -->
        <div class="eh-sub-right" data-role="right-pictures">

        </div>
    </div>
</li>
{{/each}}
