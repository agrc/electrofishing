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

        // equipmentIds: [number ]
        //      the equipment ids for linking to local storage
        equipmentIds: null,

        // equipmentCounter: unique number for counting equipment widgets
        //      used to build cacheId's in _MultipleWidgetsWithAddBtnMixin
        equipmentCounter: 2,

        constructor: function () {
            // summary:
            //      description
            // param or return
            console.log('app/method/Method:constructor', arguments);

            this.AddBtnWidgetClass = Equipment;
            localforage.getItem(this.cacheId).then((ids) => {
                if (!ids) {
                    localforage.setItem(this.cacheId, []);
                }
            });
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
                }

                return previous;
            });
        },
        initChildWidgets: function () {
            // summary:
            //      overriden from _MultipleWidgetsWithAddBtnMixin to allow for localforage caching
            //      sets up initial child widget
            //      adds additional widgets if there is in progress data that has been cached
            console.log('app/method/Method:initChildWidgets', arguments);

            this.promise = localforage.getItem(this.cacheId).then((ids) => {
                if (ids && ids.length > 0) {
                    this.equipmentIds = ids;
                    this.equipmentCounter = Math.max(...this.equipmentIds) + 1;
                    this.createEquipments(this.equipmentIds);
                } else {
                    this.equipmentIds = [1];
                    this.addAddBtnWidget(1);
                }
            });

            return this.promise;
        },
        createEquipments: function (equipmentIds) {
            // summary:
            //      creates equipments with their ids from the
            //      existing local storage array
            console.log('app/method/Method:createEquipments', arguments);

            equipmentIds.forEach((id) => this.addAddBtnWidget(id, true));

            localforage.setItem(this.cacheId, equipmentIds);
        },
        addAddBtnWidget(id, skipStorageUpdate) {
            // summary:
            //      calls into _MultipleWidgetsWithAddBtnMixin to cretae the widget
            //      adds the widget cache id the main local storage if skipStorageUpdate is unset
            console.info('app/method/Method:addAddBtnWidget', arguments);

            const widget = this.inherited(arguments);

            if (skipStorageUpdate === true) {
                return;
            }

            localforage.getItem(this.cacheId).then((ids) => {
                if (!ids) {
                    ids = [];
                }

                const lastId = ids[ids.length - 1];
                ids.push(widget.cacheId);

                localforage.setItem(this.cacheId, ids);

                if (ids.length <= 1) {
                    return;
                }

                localforage.getItem(`${widget.cachePrefix}_${lastId}`).then((data) => {
                    widget.hydrateWithInProgressData(data);
                });
            });
        },
        onRemoveAddBtnWidget: function (widget) {
            // summary:
            //      add additional functionality to base method to cache in progress data
            console.log('app/method/Method:onRemoveAddBtnWidget', arguments);

            this.inherited(arguments);

            localforage.getItem(this.cacheId).then((ids) => {
                ids.splice(ids.indexOf(widget.cacheId), 1);

                localforage.setItem(this.cacheId, ids);
            });
        },
        clear: function () {
            // summary:
            //      add additional functionality to base method to clear in progress cache
            // param or return
            console.log('app/method/Method:clear', arguments);

            localforage.removeItem(this.cacheId);

            this.inherited(arguments);
        },
        getAnodesData: function () {
            // summary:
            //      loops through all items and concatinates all of the grid data for the Anodes table
            console.log('app/method/Method:getAnodesData', arguments);

            return this.addBtnWidgets.reduce(function (sum, widget) {
                return sum.concat(widget.getAnodesData());
            }, []);
        }
    });
});
