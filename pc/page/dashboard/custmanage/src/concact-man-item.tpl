{{#each data.items}}
<div class="eh-custm-mycon-table eh-custm-one-people-box" data-role="one-concact" userId="{{this.userId}}">
    <div class="eh-custm-mycon-left">
        <a class="eh-custm-people-photo" href="javascript:void(0);">
            {{#if this.userPhoto}}
            <img src="{{this.userPhoto}}" >
            {{else}}
            {{photoLetter this.userName}}
            {{/if}}
        </a>
        <div class="eh-custm-mycon-info-box">
            <p class="eh-custm-mycon-info-item eh-custm-mycon-name" data-role="connect-user-name" title="{{this.userName}}">{{this.userName}}</p>
            <p class="eh-custm-mycon-info-item eh-custm-mycon-position">{{this.userPosition}}</p>
            <p class="eh-custm-mycon-info-item eh-custm-mycon-company" data-role="connect-company-name" companyId="{{this.companyId}}" title="{{this.companyName}}">{{this.companyName}}</p>
            <p class="eh-custm-mycon-info-item eh-custm-mycon-product {{#if this.companyMainProducts}}js-eh-main-product-list{{/if}}" data-role="main-product" title="{{showMainProduct this.companyMainProducts 1}}">Main Products: {{showMainProduct this.companyMainProducts 1}}</p>
        </div>
    </div>
    <div class="eh-custm-mycon-middle">

        <div class="eh-custm-mycon-notes" data-role="show-notes-box">
            {{#if this.comment}}
            <!-- 有备注的状态 -->
            <div class="js-has-notes-box">
                <p class="eh-custm-mycon-remarks" data-role="concact-notes">{{this.comment}}</p>
                <p class="eh-custm-mycon-editbox">
                    <i class="ui2-icon ui2-icon-edit"></i><span class="eh-edit-remarks-action js-eh-edit-remarks">Edit</span>
                </p>
            </div>
            <!-- 没有备注的状态 -->
            <div class="js-no-notes-box" style="display:none;">
                <p class="eh-custm-mycon-addnotes">
                    <i class="ui2-icon ui2-icon-edit"></i><span class="eh-edit-remarks-action js-eh-edit-remarks">Add a note</span>
                </p>
            </div>
            {{else}}
            <!-- 没有备注的状态 -->
            <div class="js-no-notes-box">
                <p class="eh-custm-mycon-addnotes">
                    <i class="ui2-icon ui2-icon-edit"></i><span class="eh-edit-remarks-action js-eh-edit-remarks">Add a note</span>
                </p>
            </div>
            <!-- 有备注的状态 -->
            <div class="js-has-notes-box" style="display: none;">
                <p class="eh-custm-mycon-remarks" data-role="concact-notes">{{this.comment}}</p>
                <p class="eh-custm-mycon-editbox">
                    <i class="ui2-icon ui2-icon-edit"></i><span class="eh-edit-remarks-action js-eh-edit-remarks">Edit</span>
                </p>
            </div>
            {{/if}}

        </div>
        <!-- 填写备注的弹窗 -->
        <div class="eh-custm-mycon-edit-note-box" data-role="edit-notes-box" style="display:none;">
            <div class="remained-word-box">
                <span class="remained-word"></span>
            </div>
            <textarea maxlength="120"></textarea>
            <p class="eh-custm-mycon-editbox-btn-box">
                <span class="eh-custm-mycon-editbox-submit-btn js-btn-submit-notes">Submit</span>
                <span class="eh-custm-mycon-editbox-cancel-btn js-btn-cancel-edit">Cancel</span>
            </p>
        </div>
    </div>
    <div class="eh-custm-mycon-right">
        <span class="eh-custm-inform-button" data-role="eh-custm-inform-btn">Inform</span>
        <p class="eh-custm-inform-times">{{#if this.informNumber}}Recently Informed{{/if}}</p>
    </div>
</div>
{{/each}}
