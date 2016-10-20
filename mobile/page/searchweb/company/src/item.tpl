{{#each items}}
<li class="eh-list-item">
    <a href="/company.htm?id={{companyId}}" class="eh-list-item">
    <div class="eh-detail-item eh-connection-corner" data-role="connection">
        <span class="eh-detail-item-inner" ><!--<span class="eh-left-title">Connection:</span>--> <span data-compId="{{companyId}}" class="eh-detail-item-text eh-right-text">--</span></span>
    </div>
    <header class="eh-item-header"> {{safeString name}}</header>
    <ul class="eh-item-detail">
        <li class="eh-detail-item">
            <span class="eh-detail-item-inner"><span class="eh-left-title">Location:</span> <span class="eh-mobile-location"></span><span class="eh-right-text">{{safeString addressCity}}, {{safeString addressCountry}}</span>
        </li>
        <li class="eh-detail-item">
            <span class="eh-detail-item-inner"><span class="eh-left-title">Main Products:</span> <span class="eh-right-text">{{safeString mainProducts}}</span></span>
            </span>
        </li>
        <li class="eh-detail-item">
            <span class="eh-detail-item-inner"><span class="eh-left-title">Event History:</span> <span class="eh-right-text">Has attended {{showAttended historicalExhibitionIds}}</span></span>
        </li>
    </ul>

    <div class="eh-products-list-container">
        <ul class="eh-products-list">
            {{productPics slideShowImgUrls}}
        </ul>
    </div>

    <div class="eh-button-container">
        <button class="eh-button-full" data-btn-id="{{companyId}}" data-role="ope-btn" data-watched=false>{{#if ../btnOpt}}Loading......{{else}}Add to my Collection{{/if}}</button>
    </div>
    </a>
</li>
{{/each}}
