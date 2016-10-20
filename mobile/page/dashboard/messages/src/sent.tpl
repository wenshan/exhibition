<!-- 发出的邀请 -->
<li class="eh-footer-item" data-id="{{eId}}" data-role="info-item" data-val="sent">
    <div class="eh-item-inner">
        <div class="eh-right-dot">...</div>
        <div class="eh-left">
            <header class="eh-title">
                <span class="eh-number">{{showNum totalItem}}</span> <span class="eh-content"> Sent Notifications</span>
            </header>
            <!-- 头像列表部分 -->
            <ul class="eh-list">
                {{#each items}}
                <li class="eh-item-photo" style="background-image: url({{receiver.photo}});">
                    {{showName receiver}}
                </li>
                {{/each}}
            </ul>
        </div>
    </div>
</li>
