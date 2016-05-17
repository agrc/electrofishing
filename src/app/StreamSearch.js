define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/Color',
    'dojo/_base/array',

    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/dom-construct',

    'dojo/on',
    'dojo/query',
    'dojo/keys',
    'dojo/has',
    'dojo/mouse',
    'dojo/request/xhr',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'dojo/text!./templates/StreamSearch.html',

    'dojo/_base/sniff'
],

function (
    declare,
    lang,
    Color,
    array,

    domClass,
    domStyle,
    domConstruct,

    on,
    query,
    keys,
    has,
    mouse,
    xhr,

    _WidgetBase,
    _TemplatedMixin,

    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,

        // _deferred: [private] Dojo.Deferred
        //      Dojo.Deferred for canceling pending requests.
        _deferred: null,

        // symbolLine: esri.symbol
        //     esri.symbol zoom graphic symbol for polylines.
        symbolLine: null,

        // _graphicsLayer: [private] esri.layers.GraphicsLayer
        //      esri.layers.GraphicsLayer to hold graphics.
        _graphicsLayer: null,

        // _isOverTable: Boolean
        //      A switch to help with onBlur callback on search box.
        _isOverTable: false,

        // _timer: Object
        //      A timer to delay the search so that it doesn't fire too
        //      many times when typing quickly.
        _timer: null,

        // _currentIndex: Integer
        //      The index of the currently selected item in the results.
        _currentIndex: 0,


        // Parameters to constructor

        // map: esri.Map
        //      esri.Map reference.
        map: null,

        // promptMessage: String
        //      The label that shows up in the promptMessage for the text box.
        promptMessage: '',

        // searchField: String
        //      The field name that is to be searched.
        searchField: '',

        // zoomLevel: Integer
        //      The number of cache levels up from the bottom that you want to zoom to.
        zoomLevel: 5,

        // maxResultsToDisplay: Integer
        //      The maximum number of results that will be displayed.
        //      If there are more, no results are displayed.
        maxResultsToDisplay: 20,

        // placeHolder: String
        //     The placeholder text in the text box
        placeHolder: 'Map Search...',

        // outFields: String[]
        //      The outFields parameter in the esri.tasks.Query.
        //      If set to null, then only the searchField will be added.
        outFields: null,

        // contextField: String
        //      A second field to display in the results table to
        //      give context to the results in case of duplicate results.
        contextField: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log(this.declaredClass + '::postCreate', arguments);

            this._setUpQueryTask();
            this._wireEvents();
            this._setUpGraphicsLayer();
        },
        _setUpQueryTask: function () {
            // summary:
            //      Sets up the esri QueryTask.
            // tags:
            //      private
            console.log(this.declaredClass + '::_setUpQueryTask', arguments);

            // create new query options object
            var outFields;
            if (this.outFields) {
                outFields = this.outFields;
            } else if (this.contextField) {
                outFields = this.searchField + ',' + this.contextField;
            } else {
                outFields = this.searchField;
            }
            this.query = {
                handleAs: 'json',
                query: {
                    returnGeometry: false,
                    outFields: outFields,
                    f: 'json',
                    outSR: JSON.stringify({'wkid': 4326}),
                    maxAllowableOffset: 10,
                    geometryPrecision: 4
                }
            };
        },
        _setUpGraphicsLayer: function () {
            // summary:
            //      Sets up the graphics layer and associated symbols.
            // tags:
            //      private
            console.log(this.declaredClass + '::_setUpGraphicsLayer', arguments);

            this._graphicsLayer = new L.MultiPolyline([], {
                smoothFactor: 1.5,
                color: 'yellow'
            }).addTo(this.map);
        },
        _wireEvents: function () {
            // summary:
            //      Wires events.
            // tags:
            //      private
            console.log(this.declaredClass + '::_wireEvents', arguments);

            this.own(
                on(this.textBox, 'keyup', lang.hitch(this, this._onTextBoxKeyUp)),
                on(this.textBox, 'blur', lang.hitch(this, function () {
                    // don't hide table if the cursor is over it
                    if (!this._isOverTable) {
                        // hide table
                        this._toggleTable(false);
                    }
                })),
                on(this.textBox, 'focus', lang.hitch(this, function () {
                    if (this.textBox.value.length > 0) {
                        this._startSearchTimer();
                    }
                })),
                on(this.matchesTable, mouse.enter, lang.hitch(this, function () {
                    // set switch
                    this._isOverTable = true;

                    // remove any rows selected using arrow keys
                    query('.highlighted-row').removeClass('highlighted-row');

                    // reset current selection
                    this._currentIndex = 0;
                })),
                on(this.matchesTable, mouse.leave, lang.hitch(this, function () {
                    // set switch
                    this._isOverTable = false;

                    // set first row as selected
                    domClass.add(this.matchesList.children[0], 'highlighted-row');
                }))
            );
        },
        _onTextBoxKeyUp: function (evt) {
            // summary:
            //      Handles the text box onKeyUp evt.
            // tags:
            //      private
            console.log(this.declaredClass + '::_onTextBoxKeyUp', arguments);

            if (evt.keyCode === keys.ENTER) {
                // zoom if there is at least one match
                if (this.matchesList.children.length > 1) {
                    this._setMatch(this.matchesList.children[this._currentIndex]);
                } else {
                    // search
                    this._search(this.textBox.value);
                }
            } else if (evt.keyCode === keys.DOWN_ARROW) {
                this._moveSelection(1);
            } else if (evt.keyCode === keys.UP_ARROW) {
                this._moveSelection(-1);
            } else {
                this._startSearchTimer();
            }
        },
        _startSearchTimer: function () {
            // summary:
            //      Sets a timer before searching so that the search function
            //      isn't called too many times.
            // tags:
            //      private
            // set timer so that it doesn't fire repeatedly during typing
            console.log(this.declaredClass + '::_startSearchTimer', arguments);

            clearTimeout(this._timer);
            this._timer = setTimeout(lang.hitch(this, function () {
                this._search(this.textBox.value);
            }), 250);
        },
        _moveSelection: function (increment) {
            // summary:
            //      Moves the selected row in the results table based upon
            //      the arrow keys being pressed.
            // increment: Number
            //      The number of rows to move. Positive moves down, negative moves up.
            // tags:
            //      private
            console.log(this.declaredClass + '::_moveSelection', arguments);

            // exit if there are no matches in table
            if (this.matchesList.children.length < 2) {
                this._startSearchTimer();
                return;
            }

            // remove selected class if any
            domClass.remove(this.matchesList.children[this._currentIndex], 'highlighted-row');

            // increment index
            this._currentIndex = this._currentIndex + increment;

            // prevent out of bounds index
            if (this._currentIndex < 0) {
                this._currentIndex = 0;
            } else if (this._currentIndex > this.matchesList.children.length - 2) {
                this._currentIndex = this.matchesList.children.length - 2;
            }

            // add selected class using new index
            domClass.add(this.matchesList.children[this._currentIndex], 'highlighted-row');
        },
        _search: function (searchString) {
            // summary:
            //      Performs a search with the QueryTask using the passed in string.
            // searchString: String
            //      The string that is used to construct the LIKE query.
            // tags:
            //      private
            console.log(this.declaredClass + '::_search', arguments);

            // return if not enough characters
            if (searchString.length < 1) {
                this._deleteAllTableRows(this.matchesTable);
                return;
            }

            if (this.map.showLoader) {
                this.map.showLoader();
            }

            // update query where clause
            this.query.query.where = 'UPPER(' + this.searchField +
                ') LIKE UPPER(\'' + searchString + '%\')';

            // execute query / canceling any previous query
            if (this._deferred) {
                this._deferred.cancel();
            }

            this._deferred = xhr(AGRC.urls.streamsSearch, this.query)
                .then(lang.hitch(this,
                    function (featureSet) {
                        // clear table
                        this._deleteAllTableRows(this.matchesTable);

                        this._processResults(featureSet.features);
                    }
                ), lang.hitch(this,
                    function (err) {
                        // clear table
                        this._deleteAllTableRows(this.matchesTable);

                        // swallow errors from cancels
                        if (err.message !== 'undefined') {
                            throw new Error(this.declaredClass + ' ArcGISServerError: ' + err.message);
                        }

                        if (this.map.hideLoader) {
                            this.map.hideLoader();
                        }
                    }
                ));
        },
        _processResults: function (features) {
            // summary:
            //      Processes the features returned from the query task.
            // features: Object[]
            //      The features returned from the query task.
            // tags:
            //      private
            console.log(this.declaredClass + '::_processResults', arguments);

            try {
                console.info(features.length + ' search features found.');

                // remove duplicates
                features = this._sortArray(this._removeDuplicateResults(features));

                // get number of unique results
                var num = features.length;
                console.info(num + ' unique results.');

                // return if too many values or no values
                if (num > this.maxResultsToDisplay) {
                    this.showMessage('More than ' + this.maxResultsToDisplay + ' matches found...');
                    this._populateTable(features.slice(0, this.maxResultsToDisplay - 1));
                } else if (num === 0) {
                    this.showMessage('There are no matches.');
                } else {
                    this.hideMessage();

                    this._populateTable(features);
                }
            } catch (e) {
                throw new Error(this.declaredClass + '_processResults: ' + e.message);
            }

            if (this.map.hideLoader) {
                this.map.hideLoader();
            }
        },
        _removeDuplicateResults: function (features) {
            // summary:
            //      Removes duplicates from the set of features.
            // features: Object[]
            //      The array of features that need to be processed.
            // returns: Object[]
            //      The array after it has been processed.
            // tags:
            //      private
            console.log(this.declaredClass + '::_removeDuplicateResults', arguments);

            var list = [];
            array.forEach(features, function (f) {
                if (array.some(list, function (existingF) {
                    if (existingF.attributes[this.searchField] === f.attributes[this.searchField]) {
                        if (this.contextField) {
                            if (existingF.attributes[this.contextField] === f.attributes[this.contextField]) {
                                return true;
                            }
                        } else {
                            return true; // there is a match
                        }
                    }
                }, this) === false) {
                    // add item
                    list.push(f);
                }
            }, this);

            return list;
        },
        _populateTable: function (features) {
            // summary:
            //      Populates the autocomplete table.
            // features: Object[]
            //      The array of features to populate the table with.
            // tags:
            //      private
            console.log(this.declaredClass + '::_populateTable', arguments);

            // loop through all features
            array.forEach(features, function (feat) {
                // insert new empty row
                var row = domConstruct.create('li', {'class': 'match'}, this.msg, 'before');

                // get match value string and bold the matching letters
                var fString = feat.attributes[this.searchField];
                var sliceIndex = this.textBox.value.length;
                if (!this.contextField) {
                    row.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
                } else {
                    // add context field values
                    var matchDiv = domConstruct.create('div', {'class': 'first-cell'}, row);
                    matchDiv.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
                    var cntyDiv = domConstruct.create('div', {'class': 'cnty-cell'}, row);
                    cntyDiv.innerHTML = feat.attributes[this.contextField] || '';
                    domConstruct.create('div', {style: 'clear: both;'}, row);
                }

                // wire onclick event
                this.own(on(row, 'click', lang.hitch(this, this._onRowClick)));
            }, this);

            // select first row
            domClass.add(this.matchesList.children[0], 'highlighted-row');

            // show table
            this._toggleTable(true);
        },
        _onRowClick: function (event) {
            // summary:
            //      Handles when someone clicks on the a row in the autocomplete
            //      table.
            // event: Event
            //      The event object.
            // tags:
            //      private
            console.log(this.declaredClass + '::_onRowClick', arguments);

            this._setMatch(event.currentTarget);
        },
        _setMatch: function (row) {
            // summary:
            //      Sets the passed in row as a match in the text box and
            //      zooms to the feature.
            // row: Object
            //      The row object that you want to set the textbox to.
            // tags:
            //      private
            console.log(this.declaredClass + '::_setMatch', arguments);

            var that = this;

            // clear any old graphics
            this._graphicsLayer.setLatLngs([]);

            // clear table
            this._toggleTable(false);

            // clear prompt message
            this.hideMessage();

            // set textbox to full value
            if (!this.contextField) {
                this.textBox.value = (has('ie') < 9) ? row.innerText : row.textContent;
                this.query.query.where = this.searchField + ' = \'' + this.textBox.value + '\'';
            } else {
                // dig deeper when context values are present
                this.textBox.value = (has('ie') < 9) ? row.children[0].innerText : row.children[0].textContent;
                var contextValue = row.children[1].innerHTML;
                if (contextValue.length > 0) {
                    this.query.query.where = this.searchField + ' = \'' + this.textBox.value +
                        '\' AND ' + this.contextField + ' = \'' + contextValue + '\'';
                } else {
                    this.query.query.where = this.searchField + ' = \'' + this.textBox.value +
                        '\' AND ' + this.contextField + ' IS NULL';
                }
            }

            this.query.query.returnGeometry = true;
            xhr(AGRC.urls.streamsSearch, this.query).then(function (featureSet) {
                if (featureSet.features.length === 1 || featureSet.features[0].geometry.type === 'polygon') {
                    that._zoom(featureSet.features[0]);
                } else {
                    that._zoomToMultipleFeatures(featureSet.features);
                }
                // set return geometry back to false
                that.query.query.returnGeometry = false;
            });
        },
        showMessage: function (msg) {
            // summary:
            //      shows a messages at the top of the matches list
            // msg: String
            console.log(this.declaredClass + '::showMessage', arguments);

            this.msg.innerHTML = msg;
            domStyle.set(this.msg, 'display', 'block');
            this._toggleTable(true);
        },
        hideMessage: function () {
            // summary:
            //      hids the message at the top of the matches list
            console.log(this.declaredClass + '::hideMessage', arguments);

            domStyle.set(this.msg, 'display', 'none');
        },
        _zoom: function (graphic) {
            // summary:
            //      Zooms to the passed in graphic.
            // graphic: esri.Graphic
            //      The esri.Graphic that you want to zoom to.
            // tags:
            //      private
            console.log(this.declaredClass + '::_zoom', arguments);

            this._graphicsLayer.setLatLngs(this.getLatLngs(graphic));
            this.map.fitBounds(this._graphicsLayer.getBounds().pad(0.1));
            this.onZoomed(graphic);
        },
        getLatLngs: function (graphic) {
            // summary:
            //      description
            // graphic: {}
            // console.log(this.declaredClass + '::getLatLngs', arguments);

            return array.map(graphic.geometry.paths[0], function (p) {
                return [p[1], p[0]];
            });
        },
        onZoomed: function (/*graphic*/) {
            // summary:
            //      Fires after the map has been zoomed to the graphic.
            console.log(this.declaredClass + '::onZoomed', arguments);
        },
        _deleteAllTableRows: function (table) {
            // summary:
            //      Deletes all of the rows in the table.
            // table: Object
            //      The table that you want to act upon.
            // tags:
            //      private
            console.log(this.declaredClass + '::_deleteAllTableRows', arguments);

            // delete all rows in table
            query('li.match', this.matchesTable).forEach(domConstruct.destroy);

            // hide table
            domStyle.set(table, 'display', 'none');

            // reset current index
            this._currentIndex = 0;
        },
        _toggleTable: function (show) {
            // summary:
            //      Toggles the visibility of the autocomplete table.
            // show: Boolean
            //      If true, table is shown. If false, table is hidden.
            // tags:
            //      private
            console.log(this.declaredClass + '::_toggleTable', arguments);

            var displayValue = (show) ? 'block' : 'none';
            domStyle.set(this.matchesTable, 'display', displayValue);
        },
        _sortArray: function (list) {
            // summary:
            //      Sorts the array by both the searchField and contextField
            //      if there is a contextField specied. If no context field is
            //      specified, no sorting is done since it's already done on the server
            //      with the 'ORDER BY' statement. I tried to add a second field to the
            //      'ORDER BY' statement but ArcGIS Server just choked.
            console.log(this.declaredClass + '::_sortArray', arguments);

            // custom sort function
            var that = this;
            function sortFeatures(a, b) {
                var searchField = that.searchField;
                if (a.attributes[searchField] === b.attributes[searchField]) {
                    if (a.attributes[that.contextField] < b.attributes[that.contextField]) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (a.attributes[searchField] < b.attributes[searchField]) {
                    return -1;
                } else {
                    return 1;
                }
            }

            // sort features
            return list.sort(sortFeatures);
        },
        _zoomToMultipleFeatures: function (features) {
            // summary:
            //      Creates a multi point from features and zooms to that.
            // features: Object[]
            //      Array of features that you want to zoom to.
            // tags:
            //      private
            console.log(this.declaredClass + '::_zoomToMultipleFeatures', arguments);

            var that = this;
            var lls = array.map(features, function (g) {
                return that.getLatLngs(g);
            });
            this._graphicsLayer.setLatLngs(lls);
            this.map.fitBounds(this._graphicsLayer.getBounds().pad(0.1));
        }
    });
});
