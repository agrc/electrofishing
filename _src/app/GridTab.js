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
        },
        addTabClick: function () {
            // summary:
            //      Fired when user clicks the plus button
            console.log('app/GridTab:addTabClick', arguments);

            this.addTab();
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
