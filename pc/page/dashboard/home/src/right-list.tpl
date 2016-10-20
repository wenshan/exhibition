{{#each items}}
<li class="eh-right-list-item">
    <div class="eh-right-item-photo" style="background-image: url({{userPhoto}})">
        {{photoShow userPhoto userName}}
    </div>
    <div class="eh-right-item-content">
        <header class="eh-exhibitor-name" title="{{userName}}">{{userName}}</header>
        <ul class="eh-exhibitor-content">
            <li class="eh-exhibitor-detail" title="{{userPosition}}">{{userPosition}}<!--<span class="eh-country ui2-icon-flag-{{lower companyAddressCountry}} ui2-icon-flag-s"></span>--></li>
            <li title="{{companyName}} {{mainProducts}}" class="eh-exhibitor-detail eh-exhibitor-detail-sec">{{companyName}} {{mainProducts}}</li>
        </ul>
    </div>
</li>
{{/each}}
