{{#compare status '==' 'NoConnect'}}
<a data-val="{{userId}}" data-role="connect-button" class="eh-button-full">Connect</a>
{{/compare}}

{{#compare status '==' 'Pending'}}
<a data-id="{{userId}}" class="eh-half-button eh-accept" data-role="status-update" data-val="accept">Accept</a>
<a data-id="{{userId}}" class="eh-half-button eh-ignore" data-role="status-update" data-val="ignore">Ignore</a>
{{/compare}}

{{#compare status '==' 'Wait'}}
<div class="eh-waiting-status">Request Sent</div>
{{/compare}}

{{#compare status '==' 'Success'}}
<div class="eh-connected-status">Connected</div>
{{/compare}}
