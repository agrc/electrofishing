define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/templates/GridTab.html',
    'dojo/_base/declare'
], function (
    _TemplatedMixin,
    _WidgetBase,

    domConstruct,
    query,
    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'grid-tab',

        // currentTab: Number
        //      The currently selected pass number
        currentTab: 1,


        // parameters passed in via the constructor
        // name: String
        //      shows up in the template
        name: null,

        changeTab: function (e) {
            // summary:
            //      fires when the user clicks on a pass button
            //
            // e: Click Event
            console.log('app/GridTab:changeTab', arguments);

            var newTab = parseInt(e.target.innerText, 10);

            this.currentTab = newTab;

            this.emit('change-tab', { newTab: newTab });
        },
        clear: function () {
            // summary:
            //      clear out this widget
            console.log('app/GridTab:clear', arguments);

            query('.btn', this.tabBtnContainer).forEach(function (node) {
                if (node.innerText.trim() !== '1') {
                    domConstruct.destroy(node);
                }
            });
            this.changeTab({target: {innerText: '1'}});
        },
        addTab: function (skipAddRow) {
            // summary:
            //      add a tab to this widget
            // skipAddRow: Boolean
            //      passed on to the event
            console.log('app/GridTab:addTab', arguments);

            var lbl = domConstruct.create('label', {
                class: 'btn btn-primary',
                innerHTML: this.getNumberOfTabs() + 1,
                onclick: this.changeTab.bind(this)
            }, this.tabBtnContainer);
            domConstruct.create('input', {
                type: 'radio',
                name: 'tab'
            }, lbl);

            lbl.click();

            this.emit('add-tab', { skipAddRow: skipAddRow });

            this.removeTabBtn.disabled = false;
        },
        onAddTabClick: function () {
            // summary:
            //      make sure that undefined is passed for skipAddRow to addTab
            // param or return
            console.log('app/GridTab:onAddTabClick', arguments);

            this.addTab();
        },
        removeTab: function () {
            // summary:
            //      removes a tab from this widget
            console.log('app/GridTab:removeTab', arguments);

            const children = this.tabBtnContainer.children;
            const deleteTabNum = this.getNumberOfTabs();
            const confirmDeleteMessage = `Are you sure that you want to delete ${this.name} #${deleteTabNum} ?`;

            if (children.length > 1 && window.confirm(confirmDeleteMessage)) {
                this.emit('remove-tab', { tabNum: deleteTabNum });

                const tab = children[children.length - 1];
                domConstruct.destroy(tab);

                if (children.length === 1) {
                    this.removeTabBtn.disabled = true;
                }

                const tabs = query('label', this.tabBtnContainer);
                tabs[tabs.length - 1].click();
            }
        },
        getNumberOfTabs: function () {
            // summary:
            //      returns the number of passes
            // returns: Number
            console.log('app/catch/Catch:getNumberOfTabs', arguments);

            return query('.btn', this.tabBtnContainer).length;
        }
    });
});
