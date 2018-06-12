define([
    'dojo/aspect',
    'dojo/dom-construct',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    aspect,
    domConstruct,
    array,
    declare,
    lang
) {
    // summary:
    //      Used to manage multiple _AddBtnWidget's
    return declare(null, {
        // noAddBtnWidgetPropErrMsg: String
        noAddBtnWidgetPropErrMsg: 'AddBtnWidgetClass property not set!',

        // AddBtnWidgetClass: dojo Class
        //      The class that the AddBtn widget is using for this widget
        AddBtnWidgetClass: null,

        // addBtnWidgets: _AddBtnMixin[]
        //      A list of the _AddBtnMixin widgets associated with this widget
        addBtnWidgets: null,


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/_MultipleWidgetsWithAddBtnMixin:postCreate', arguments);

            if (!this.AddBtnWidgetClass) {
                throw this.noAddBtnWidgetPropErrMsg;
            }

            this.addBtnWidgets = [];

            this.initChildWidgets();

            this.inherited(arguments);
        },
        initChildWidgets: function () {
            // summary:
            //      Adds a single widget to start with
            console.log('app/_MultipleWidgetsWithAddBtnMixin:initChildWidgets', arguments);

            this.addAddBtnWidget();
        },
        addAddBtnWidget: function (id) {
            // summary:
            //      Fires when the add button is pressed on the _addBtn widget
            console.log('app/_MultipleWidgetsWithAddBtnMixin:addAddBtnWidget', arguments);

            if (id === null || id === undefined) {
                id = this.equipmentCounter;
                this.equipmentCounter += 1;
            }

            var widget = new this.AddBtnWidgetClass(
                {
                    container: this,
                    // for local caching of Method only, doesn't hurt moreinfodialog
                    cacheId: id || this.equipmentCounter
                },
                domConstruct.create('div', {}, this.addBtnWidgetsContainer)
            );
            widget.startup();

            this.addBtnWidgets.push(widget);

            this.wireAddBtnWidgetOnAdd(widget);

            if (this.addBtnWidgets.length > 1) {
                this.addBtnWidgets[this.addBtnWidgets.length - 2].toggleButton(true);
            }

            return widget;
        },
        wireAddBtnWidgetOnAdd: function (widget) {
            // summary:
            //      wires up the onAdd event for the passed in widget
            // widget: Backpack
            console.log('app/_MultipleWidgetsWithAddBtnMixin:wireAddBtnWidgetOnAdd', arguments);

            this.own(
                aspect.after(widget, 'onAdd', lang.hitch(this, 'addAddBtnWidget')),
                aspect.before(widget, 'onRemove', lang.partial(lang.hitch(this, 'onRemoveAddBtnWidget'), widget))
            );
        },
        onRemoveAddBtnWidget: function (widget) {
            // summary:
            //      fires when the user clicks on the minus button for the add button widget
            // widget: _AddBtnMixin Widget
            //      the widget that needs to be removed
            console.log(this.declaredClass + '::onRemoveAddBtnWidget', arguments);

            this.addBtnWidgets.splice(array.indexOf(this.addBtnWidgets, widget), 1);
        },
        clear: function () {
            // summary:
            //      removes all widgets except the first one
            console.log('app/_MultipleWidgetsWithAddBtnMixin:clear', arguments);

            array.forEach(this.addBtnWidgets, function (addBtn) {
                addBtn.destroyRecursive(false);
            });

            this.addBtnWidgets = [];

            this.addAddBtnWidget();
        },
        getData: function () {
            // summary:
            //      gathers data from all child widgets and returns them as an array
            // returns: Object[]
            console.log('app/_MultipleWidgetsWithAddBtnMixin:getData', arguments);

            var data = [];
            array.forEach(this.addBtnWidgets, function (addBtn) {
                var d = addBtn.getData();

                if (d !== null) {
                    data.push(d);
                }
            });

            return data;
        },
        setData: function (features) {
            // summary:
            //      creates and pre-populates the addBtnWidgets with the features data
            // features: {attributes: {...}}[]
            console.log('app/_MultipleWidgetsWithAddBtnMixin:setData', arguments);

            // there's already a blank widget so fill that one in first
            if (features[0]) {
                this.addBtnWidgets[0].setData(features[0]);
            }

            for (var i = 1; i < features.length; i++) {
                this.addAddBtnWidget().setData(features[i], (i < features.length));
            }
        }
    });
});
