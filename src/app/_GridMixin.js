define([
    'dgrid/Editor',
    'dgrid/Keyboard',
    'dgrid/OnDemandGrid',
    'dgrid/Selection',

    'dojo/keys',
    'dojo/on',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dstore/Memory',
    'dstore/Trackable'
], function (
    Editor,
    Keyboard,
    DGrid,
    Selection,

    keys,
    on,
    array,
    declare,
    lang,

    Memory,
    Trackable
) {
    // summary:
    //      Mixin to add dgrid to a widget.
    return declare(null, {

        // grid: DGrid
        grid: null,

        // store: DStore
        //      the store that is used to populate the grid
        store: null,

        // selectedRow: _Row
        //      the currently selected row in the grid
        selectedRow: null,

        initGrid: function (columns) {
            // summary:
            //      creates the grid with the specified columns
            // columns: Object[]
            //      Array of column definition objects
            console.log('app/_GridMixin:initGrid', arguments);

            this.grid = new (declare([DGrid, Keyboard, Selection, Editor]))({
                selectionMode: 'single',
                columns: columns,
                deselectOnRefresh: false
            }, this.gridDiv);

            on(this.grid, 'keydown', lang.hitch(this, this.onGridKeydown));
            on(this.grid, 'dgrid-select', lang.hitch(this, this.onRowSelected));
            on(this.grid, 'dgrid-deselect', lang.hitch(this, this.onRowDeselected));

            this.setGridData([]);
        },
        onRowSelected: function (evt) {
            // summary:
            //      fires when a row is selected
            // evt: dgrid-select event object
            console.log('app/_GridMixin:onRowSelected', arguments);

            this.set('selectedRow', evt.rows[0]);
        },
        onRowDeselected: function () {
            // summary:
            //      fires when a row is deselected
            // evt: dgrid-deselect event object
            console.log('app/_GridMixin:onRowDeselected', arguments);

            var that = this;
            var selectedId = this.selectedRow;
            setTimeout(function () {
                if (that.selectedRow === selectedId) {
                    that.set('selectedRow', null);
                }
            }, 50);
        },
        _setSelectedRowAttr: function (row) {
            // summary:
            //
            // row: _Row
            console.log('app/_GridMixin:_setSelectedRowAttr', arguments);

            this._set('selectedRow', row);
        },
        onGridKeydown: function (e) {
            // summary:
            //      keydown callback for grid
            //      Listens for TAB and shift keys and moves focus to next or previous
            //      cells.
            //      If we are at the end of the last row, it calls addRow
            // e: Keyboard Event
            console.log('app/_GridMixin:onGridKeydown', arguments);

            var passData;
            var that = this;
            var modifierKeys = [
                keys.TAB,
                keys.LEFT_ARROW,
                keys.UP_ARROW,
                keys.RIGHT_ARROW,
                keys.DOWN_ARROW
            ];

            var advance = function () {
                if (that.grid.column(e.target).field === that.lastColumn) {
                    // last column
                    if (that.grid.row(e.target).data[that.idProperty] === passData[passData.length - 1][that.idProperty]) {
                        // last row for this pass
                        that.addRow();
                    } else {
                        // skip fields
                        Keyboard.moveFocusHorizontal.call(that.grid, e, that.skipNumber);
                    }
                } else {
                    Keyboard.moveFocusRight.call(that.grid, e);
                }
            };
            var retreat = function () {
                if (that.grid.column(e.target).field === that.firstColumn) {
                    // first column skip fields
                    Keyboard.moveFocusHorizontal.call(that.grid, e, -that.skipNumber);
                } else {
                    Keyboard.moveFocusLeft.call(that.grid, e);
                }
            };

            if (array.indexOf(modifierKeys, e.keyCode) !== -1) {
                passData = this.grid.collection.fetchSync();
                switch (e.keyCode) {
                    case keys.TAB:
                        if (!e.shiftKey) {
                            advance();
                        } else {
                            retreat();
                        }
                        break;
                    case keys.LEFT_ARROW:
                        retreat();
                        break;
                    case keys.RIGHT_ARROW:
                        advance();
                        break;
                    case keys.UP_ARROW:
                        Keyboard.moveFocusUp.call(that.grid, e);
                        break;
                    case keys.DOWN_ARROW:
                        Keyboard.moveFocusDown.call(that.grid, e);
                        break;
                }
            }
        },
        deleteRow: function () {
            // summary:
            //      Removes the currently selected row from the data store
            console.log('app/_GridMixin:deleteRow', arguments);

            this.grid.save();

            if (this.getSelectedRow()) {
                this.store.removeSync(this.getSelectedRow().data[this.idProperty]);
            }
        },
        getSelectedRow: function () {
            // summary:
            //      gets the currently selected row in the grid
            console.log('app/_GridMixin:getSelectedRow', arguments);

            for (var id in this.grid.selection) {
                if (this.grid.selection.hasOwnProperty(id)) {
                    return this.grid.row(id);
                }
            }
        },
        addRow: function () {
            // summary:
            //      this needs to be implemented by the child object
            console.log('app/_GridMixin:addRow', arguments);

        },
        isGridValid: function () {
            // summary:
            //      Confirms that there is at least one row and that it
            //      has a value in the first visible field
            console.log('app/_GridMixin:isGridValid', arguments);

            this.grid.save();
            if (this.store.data[0][this.firstColumn] !== null) {
                return true;
            } else {
                return this.invalidGridMsg;
            }
        },
        getGridData: function () {
            // summary:
            //      description
            console.log('app/_GridMixin:getGridData', arguments);

            var data = this.store.fetchSync();

            if (data.length > 0) {
                // remove any empty rows
                while (data[data.length - 1] && data[data.length - 1][this.firstColumn] === null) {
                    data.pop();
                }

                data.forEach(function removeIgnoreFields(d) {
                    delete d[this.ignoreColumn];
                }, this);

                return data;
            } else {
                return [];
            }
        },
        setGridData: function (data) {
            // summary:
            //      pre-populates the grid with the passed in data
            // data: Array
            console.log('app/_GridMixin:setGridData', arguments);

            var TrackableMemory = declare([Trackable, Memory]);
            this.store = new TrackableMemory({
                data: data,
                idProperty: this.idProperty
            });

            this.grid.set('collection', this.store);
        },
        clearGrid: function () {
            // summary:
            //      clears the grid data
            console.log('app/_GridMixin:clearGrid', arguments);

            this.setGridData([]);
            this.addRow();
        }
    });
});
