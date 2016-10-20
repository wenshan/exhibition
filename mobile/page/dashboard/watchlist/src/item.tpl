{{#each items}}

<li class="eh-list-item">
    <a href="/company.htm?id={{companyId}}">
        <div class="eh-detail-item eh-connection-corner">
            <span class="eh-detail-item-inner"><!--<span class="eh-left-title">Connection:</span>--> <span data-compId="{{companyId}}" class="eh-detail-item-text eh-right-text">--</span></span>
        </div>
        <header class="eh-item-header"> {{companyName}}</header>
        <ul class="eh-item-detail">
            <li class="eh-detail-item">
                <span class="eh-detail-item-inner"><span class="eh-left-title">Location:</span> <span class="eh-mobile-location"></span><span class="eh-right-text">{{companyAddressCity}}, {{companyAddressCountryName}}</span>
            </li>
            <li class="eh-detail-item">
                <span class="eh-detail-item-inner"><span class="eh-left-title">Main Products:</span> <span class="eh-right-text">{{mainProductsShow mainProducts}}</span></span>
                </span>
            </li>
            <li class="eh-detail-item">
                <span class="eh-detail-item-inner"><span class="eh-left-title">History:</span> <span class="eh-right-text">Has attended {{showExhibitionNum historyExhNumber}}</span></span>
            </li>
        </ul>

        <div class="eh-products-list-container">
            <ul class="eh-products-list">
                {{productPics picList}}
            </ul>
        </div>

        <div class="eh-button-container">
            <button data-val="watched" class="eh-button-full" data-btn-id="{{companyId}}" data-role="ope-btn">Remove</button>
        </div>
    </a>
</li>
{{/each}}
