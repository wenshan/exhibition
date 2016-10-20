
{{#each data.items}}

<li class="eh-pedding-people-item" data-role="one-request-box" userId="{{this.userId}}">
    <p class="eh-pedding-people-info-item">
        <a class="eh-pedding-people-photo" href="javascript:void(0);">
            {{#if this.userPhoto}}
            <img src="{{this.userPhoto}}" />
            {{else}}
            {{photoLetter this.userName}}
            {{/if}}
        </a>
    </p>
    <p class="eh-pedding-people-info-item eh-pedding-people-name">
        <span data-role="user-name" title="{{this.userName}}">{{this.userName}}</span>
    </p>
    <p class="eh-pedding-people-info-item">
        <!-- <i class="ui2-icon-flag-{{toLowerCase this.companyAddressCountry}} ui2-icon-flag-s"></i>
        <span class="eh-pedding-country">{{this.companyAddressCountryName}}</span> -->
        {{this.userPosition}}
    </p>
    <p class="eh-pedding-people-info-item eh-pedding-people-info-position" data-role="connect-company-name" companyId="{{this.companyId}}" title="{{this.companyName}}">
        {{this.companyName}}
    </p>
    <p class="eh-pedding-people-info-item" userId="{{userId}}" data-role="oprate-box">

        {{#if ../data.isReceive}}
        <span class="eh-pedding-accept-btn js-oprate-pending" data-role="accept-contact">Accept</span>
        <span class="eh-pedding-Ignore-btn js-oprate-pending" data-role="ignore-contact">Ignore</span>
        {{else}}
        <!--<span class="eh-pending-status">{{showStatus this.status}}</span>-->
        <span class="eh-pending-status">{{showStatus this.status}}</span>
        {{/if}}
    </p>
</li>
{{/each}}
