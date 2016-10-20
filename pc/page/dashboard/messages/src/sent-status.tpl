{{#compare status '==' 'NoConnect'}}
<a data-role="connect-button" class="ui2-button ui2-button-default ui2-button-primary ui2-button-medium">Connect</a>
{{/compare}}

{{#compare status '==' 'Pending'}}
<a data-id="{{userId}}" class="ui2-button ui2-button-default ui2-button-primary ui2-button-medium" data-role="status-update" data-val="accept">Accept</a>
<a data-id="{{userId}}" class="ui2-button ui2-button-default ui2-button-normal ui2-button-medium eh-btn-ignore" data-role="status-update" data-val="ignore">Ignore</a>
{{/compare}}

{{#compare status '==' 'Wait'}}
<span class="eh-waiting-status">Request Sent</span>
{{/compare}}

{{#compare status '==' 'Success'}}
<span class="eh-connected-status">Connected</span>
{{/compare}}
