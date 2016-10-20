{{#each items}}
<li class="eh-info-item" data-role="pop-info-item">
    <div class="eh-info-item-inner">
        <header class="eh-people">
            <div class="eh-people-photo" style="background-image: url({{fromUser.photo}});">
                {{showName fromUser}}
            </div>
            <div class="eh-people-right">
                <header class="eh-people-name">{{showSafeString fromUser.userName}}</header>
                <div class="eh-position">{{showSafeString fromUser.position}}</div>
                <a href="/company.htm?id={{fromUser.companyId}}" class="eh-company">{{showSafeString fromUser.companyName}}</a>
            </div>
        </header>
        <section class="eh-messages-container">
            <header class="eh-messages" data-role="message-check">
                <span class="eh-message-tip">{{messages.length}}</span><span class="eh-message-title">Message</span>
            </header>

            <ul class="eh-messages-list" data-role="messages-list">
                {{#unless messages.length}}
                <li class="eh-messages-item eh-no-message">
                    No message here!
                </li>
                {{/unless}}
                {{#each messages}}
                <li class="eh-messages-item">
                    <header class="eh-message-date">{{showDateFromNow gmtCreate}}</header>
                    <div class="eh-message-text">
                        {{showMessageContent content}}
                    </div>
                </li>
                {{/each}}
            </ul>
        </section>
        <section class="eh-operation" data-role="popup-operation" data-id="{{fromUser.id}}">

        </section>
    </div>
</li>
{{/each}}
