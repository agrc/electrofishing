define([
    'app/config',
    'app/method/Equipment',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',
    'app/_MultipleWidgetsWithAddBtnMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/method/templates/Method.html',
    'dojo/_base/declare',

    'localforage',

    'bootstrap-combobox/js/bootstrap-combobox'
], function (
    config,
    Equipment,
    _AddBtnMixin,
    _ClearValuesMixin,
    _MultipleWidgetsWithAddBtnMixin,

    _TemplatedMixin,
    _WidgetBase,

    template,
    declare,

    localforage
) {
    return declare([_WidgetBase, _TemplatedMixin, _MultipleWidgetsWithAddBtnMixin], {
        templateString: template,
        baseClass: 'method',

        // cacheId: String
        //      used to build cacheId's in _MultipleWidgetsWithAddBtnMixin
        cacheId: 'app/method',

        constructor: function () {
            // summary:
            //      description
            // param or return
            console.log('app/method/Method:constructor', arguments);

            this.AddBtnWidgetClass = Equipment;
        },
        isValid: function () {
            // summary:
            //      description
            console.log('app/method/Method:isValid', arguments);

            return this.addBtnWidgets.map(function checkValid(widget) {
                return widget.isValid();
            }).reduce(function (previous, current) {
                if (previous === true) {
                    return current;
                } else {
                    return previous;
                }
            });
        },
        initChildWidgets: function () {
            // summary:
            //      overriden from _MultipleWidgetsWithAddBtnMixin to allow for localforage caching
            //      sets up initial child widget
            //      adds additional widgets if there is in progress data that has been cached
            console.log('app/method/Method:initChildWidgets', arguments);

            var that = this;
            this.promise = localforage.getItem(this.cacheId).then(function (childWidgetsNum) {
                if (childWidgetsNum && childWidgetsNum > 0) {
                    for (var i = 0; i < childWidgetsNum; i++) {
                        that.addAddBtnWidget();
                    }

                    // reset cache number to be correct
                    localforage.setItem(that.cacheId, childWidgetsNum);
                } else {
                    that.addAddBtnWidget();
                }
            });
            return this.promise;
        },
        addAddBtnWidget: function () {
            // summary:
            //      add additional functionality to base method to cache in progress data
            console.log('app/method/Method:addAddBtnWidget', arguments);

            this.inherited(arguments);

            localforage.setItem(this.cacheId, this.addBtnWidgets.length);
        },
        onRemoveAddBtnWidget: function () {
            // summary:
            //      add additional functionality to base method to cache in progress data
            console.log('app/method/Method:onRemoveAddBtnWidget', arguments);

            this.inherited(arguments);

            localforage.setItem(this.cacheId, this.addBtnWidgets.length);
        },
        clear: function () {
            // summary:
            //      add additional functionality to base method to clear in progress cache
            // param or return
            console.log('app/method/Method:clear', arguments);

            localforage.removeItem(this.cacheId);

            this.inherited(arguments);
        }
    });
});
