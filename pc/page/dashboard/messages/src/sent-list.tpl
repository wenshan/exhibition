{{#each items}}
<li class="eh-received-item">
    <div class="eh-received-item-inner">
        <span class="eh-user-photo" style="background-image: url({{receiver.photo}});">
            {{showName receiver.photo receiver.userName}}
            <span class="eh-message-tip" data-cat="sent" data-role="messages" data-val="{{receiver.id}}">{{messages.length}}</span>
        </span>

        <div class="eh-invitor-info">
            <header class="eh-invitor-info-name" title="{{receiver.userName}}">{{receiver.userName}}</header>
            <footer class="eh-invitor-info-career">{{receiver.position}}</footer>
        </div>

        <a href="/company.htm?id={{receiver.companyId}}" class="eh-invitor-company-info" title="{{receiver.companyName}}">{{receiver.companyName}}</a>

        <div class="eh-opt-btns" data-role="status-area-sent" data-userid="{{#if receiver}}{{receiver.id}}{{/if}}">
            <span>Loading......</span>
        </div>
    </div>
</li>
{{/each}}
