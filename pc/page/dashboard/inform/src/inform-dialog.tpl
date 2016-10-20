<div class="ui2-dialog ui2-dialog-normal ui2-dialog-transition">
    {{#hasCloseX}}<i class="ui2-dialog-close ui2-icon ui2-icon-cross" data-role="close"></i>{{/hasCloseX}}
    {{#has title}}<h3 class="ui2-dialog-title" data-role="title">{{title}}</h3>{{/has}}
    <div class="ui2-dialog-bd">
        <div class="ui2-dialog-content" data-role="content">{{content}}</div>
        {{#buttonsHelp buttons}}
        <div class="ui2-dialog-btn {{buttonPosition}}" data-role="buttons">
            {{#htmlHelp buttons i18n}}
                {{#each buttons}}{{{html}}}{{/each}}
            {{/htmlHelp}}
        </div>
        {{/buttonsHelp}}
        <div class="eh-inform-feedback" data-role="feeback">{{feedback}}</div>
    </div>
</div>
