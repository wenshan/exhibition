{{#compare status '==' 'NoConnect'}}
<a class="eh-contact-button" data-val="{{userId}}" data-role="connect-button">Connect</a>
{{/compare}}

{{#compare status '==' 'Pending'}}
<div class="eh-connect">You have a connection request from this person</div>
<a data-id="{{userId}}" class="ui2-button ui2-button-default ui2-button-primary ui2-button-medium" data-role="status-update" data-val="accept">Accept</a>
<a data-id="{{userId}}" class="ui2-button ui2-button-default ui2-button-normal ui2-button-medium eh-btn-ignore" data-role="status-update" data-val="ignore">Ignore</a>
{{/compare}}

{{#compare status '==' 'Wait'}}
<span class="eh-waiting-status">Connection request sent</span>
{{/compare}}

{{#compare status '==' 'Success'}}
<span class="eh-connected-status">Connected</span>
{{/compare}}
