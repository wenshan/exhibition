{{#each items}}
<li class="eh-list-item">
    <div class="eh-list-item-sub" data-role="list-item" data-href="/company.htm?id={{companyId}}">
        <!-- 左边区域 -->
        <div class="eh-sub-left" data-role="list-item-left">
            <!-- 收藏按钮 -->
            <span class="eh-collection-btn active" data-id="{{companyId}}" data-role="collection-btn"></span>
            <a class="eh-list-item-header" href="/company.htm?id={{companyId}}" title="{{companyName}}">
                <span class="eh-company-name">
                {{companyName}}
                </span>
            </a>
            <!-- 公司信息部分 -->
            <ul class="eh-company-info">
                <li class="eh-company-info-item">
                    <span class="eh-info-item-left">
                        Location:
                    </span><span class="eh-info-item-right eh-location">
                        {{companyAddressCity}}, {{companyAddressCountry}}
                    </span>
                </li>
                <li class="eh-company-info-item">
                    <span class="eh-info-item-left">
                        Main Products:
                    </span><span class="eh-info-item-right" title="{{mainProductsShow mainProducts}}">
                        {{mainProductsShow mainProducts}}
                    </span>
                </li>
                <li class="eh-company-info-item">
                    <span class="eh-info-item-left">
                        History:
                    </span><span class="eh-info-item-right">
                        Has attended {{historyExhNumberShow historyExhNumber}}
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
