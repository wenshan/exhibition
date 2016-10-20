{{#each items}}
    <li data-id="{{id}}" class="eh-slide-list-item {{#unless @index}}active{{/unless}}" data-role="slide-item">
        <div class="eh-slide-list-item-inner">
            <span class="eh-arrow-helper"></span>
            <div class="eh-slide-item-inner">
                <header class="eh-item-date">
                    {{startTime}} - {{endTime}}
                </header>
                <footer class="eh-item-name" title="{{name}}">{{name}}</footer>
            </div>
        </div>
    </li>
{{/each}}
