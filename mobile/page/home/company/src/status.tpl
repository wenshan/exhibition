{{#compare status '==' 'NoConnect'}}
<a data-val="{{userId}}" data-role="connect-button" class="eh-connect">connect</a>
{{/compare}}

{{#compare status '==' 'Pending'}}
<a data-id="{{userId}}" class="eh-connect" data-role="status-update" data-val="accept">Accept</a>
<a data-id="{{userId}}" class="eh-connect" data-role="status-update" data-val="ignore">Ignore</a>
{{/compare}}

{{#compare status '==' 'Wait'}}
<span class="eh-waiting-status">Connection request sent</span>
{{/compare}}

{{#compare status '==' 'Success'}}
<span class="eh-connected-status">Connected</span>
{{/compare}}
