{{#each items}}
<li class="eh-received-item">
    <div class="eh-received-item-inner">
        <span class="eh-user-photo" style="background-image: url({{fromUser.photo}});">
            {{showName fromUser.photo fromUser.userName}}
            <span class="eh-message-tip" data-cat="received" data-role="messages" data-val="{{fromUser.id}}">{{messages.length}}</span>
        </span>

        <div class="eh-invitor-info">
            <header class="eh-invitor-info-name" title="{{fromUser.userName}}">{{fromUser.userName}}</header>
            <footer class="eh-invitor-info-career">{{fromUser.position}}</footer>
        </div>

        <a class="eh-invitor-company-info" href="/company.htm?id={{fromUser.companyId}}" title="{{fromUser.companyName}}">{{fromUser.companyName}}</a>

        <div class="eh-opt-btns" data-role="status-area-receive" data-userid="{{#if fromUser}}{{fromUser.id}}{{/if}}">
            <span>Loading......</span>
        </div>
    </div>
</li>
{{/each}}
