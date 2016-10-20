<div class="clearfix">
        <div class="tips-action">
            {{#if isLogined}}
            <div class="user-name" title="{{userName}}">hi, {{userName}}</div>
            {{else}}
            <div class="signin"><a href="/login.htm">Sign In</a></div>
            {{/if}}

        </div>

        <div class="muen-box  {{#if isLogined}}linem{{/if}}">
            <ul>
                <li class="current"><a href="/index.htm" title="home"><i class="icon icon-user01"></i><label>Home</label></a></li>
                <li><a href="/dashboard/home/index.htm" title="my page"><i class="icon icon-mypage"></i><label>My Page</label></a></li>
                <li><a href="/dashboard/custmanage/custmanage.htm" title="Connect"><i class="icon icon-user02"></i><label>Connect</label></a></li>
                <li><a href="/dashboard/messages/index.htm" title="Message"><i class="icon icon-user03"></i><label>Message</label></a></li>
                <li><a href="/dashboard/watchlist/index.htm" title="Watch list"><i class="icon icon-user04"></i><label>Watch list</label></a></li>
                <li><a href="/dashboard/planner/index.htm" title="Planner"><i class="icon icon-user05"></i><label>Planner</label></a></li>
            </ul>
        </div>
        {{#if isLogined}}
         <div class="log-out"><a href="/login/logout.htm" title="Log out">Sign out</a></div>
         {{/if}}
    </div>
