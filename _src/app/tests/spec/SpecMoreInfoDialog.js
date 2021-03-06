require([
  'app/catch/MoreInfoDialog',
  'react-app/config',

  'dojo/dom-construct',
  'dojo/query',
  'dojo/_base/window',
], function (
  MoreInfoDialog,
  config,

  domConstruct,
  query,
  win
) {
  // TODO: remove once this module is converted to a component
  config = config.default;

  describe('app/catch/MoreInfoDialog', function () {
    var testWidget;
    var destroy = function (widget) {
      widget.destroy();
      widget = null;
    };
    var catchMock;
    var guid = 'blah';
    beforeEach(function () {
      var row = {};
      row[config.fieldNames.fish.FISH_ID] = guid;
      row[config.fieldNames.fish.CATCH_ID] = 3;
      row[config.fieldNames.fish.PASS_NUM] = 1;
      catchMock = {
        store: {
          data: [row],
          getSync: function () {
            return this.data[0];
          },
          putSync: function () {},
        },
      };
      testWidget = new MoreInfoDialog({ catch: catchMock }, domConstruct.create('div', {}, win.body()));
      testWidget.startup();
    });
    afterEach(function () {
      destroy(testWidget);
    });
    it('create a valid object', function () {
      expect(testWidget).toEqual(jasmine.any(MoreInfoDialog));
    });
    describe('show', function () {
      afterEach(function () {
        testWidget.onCancel(); // hide the dialog
      });
      it("sets the fish and pass id's in the dialog title", function () {
        testWidget.show(guid, 'Diet_tab');

        expect(testWidget.catchId.innerHTML).toBe('3');
        expect(testWidget.passId.innerHTML).toBe('1');
      });
      it('sets the current fish id', function () {
        testWidget.show(guid, 'Diet_tab');

        expect(testWidget.currentFishId).toEqual(guid);
      });
      it('shows the passed in tab name', function () {
        testWidget.show(guid, 'Tag_tab');

        expect(query('.tab-pane.in.active', testWidget.domNode)[0].id).toEqual('Tag_tab');
        expect(query('.nav-tabs li.active a', testWidget.domNode)[0].hash).toEqual('#Tag_tab');

        testWidget.show(guid, 'Health_tab');

        expect(query('.tab-pane.in.active', testWidget.domNode)[0].id).toEqual('Health_tab');
        expect(query('.nav-tabs li.active a', testWidget.domNode)[0].hash).toEqual('#Health_tab');
      });
    });
    describe('onSubmitClick', function () {
      var value = 'blah';
      var part = 'spine';
      function setData() {
        function populateSelect(select, newValue) {
          domConstruct.create('option', { value: newValue }, select);
          select.value = newValue;
        }
        populateSelect(testWidget.collectionPartSelect, part);

        // call this manually since we aren't waiting for lst to resolve in postCreate
        $(testWidget.domNode).find('select').combobox();
      }

      beforeEach(function () {
        $(testWidget.health.domNode).find('select').combobox();
      });

      it('gathers the diet grid data', function () {
        setData();

        testWidget.currentFishId = 'b';
        spyOn(testWidget, 'getGridData').and.returnValue([
          {
            TEMP_ID: 'remove me',
            CATCH_ID: '',
          },
          {
            TEMP_ID: 'remove me also',
            CATCH_ID: '',
          },
        ]);

        testWidget.onSubmitClick();

        expect(testWidget.getData('diet')[0]).toEqual({ CATCH_ID: '', FISH_ID: 'b' });
        expect(testWidget.getData('diet').length).toEqual(2);
      });
      it('gathers the tags data', function () {
        testWidget.currentFishId = '1';
        spyOn(testWidget.tagsContainer, 'getData').and.returnValue([
          {
            HELLO: value,
          },
          {
            HELLO: value,
          },
        ]);

        testWidget.onSubmitClick();

        testWidget.currentFishId = '123123123';
        testWidget.tagsContainer.getData.and.returnValue([
          {
            HELLO: 'another',
          },
          {
            HELLO: 'another',
          },
        ]);
        testWidget.onSubmitClick();

        expect(testWidget.getData('tags').length).toEqual(4);
      });
      it('gathers the health data', function () {
        spyOn(testWidget.health, 'getData').and.returnValue(value);

        testWidget.onSubmitClick();

        testWidget.currentFishId = '123123123';
        testWidget.onSubmitClick();

        testWidget.currentFishId = '543543534';
        testWidget.onSubmitClick();

        expect(testWidget.getData('health').length).toEqual(3);
      });
      it('gathers the hard part data and adds it to health', function () {
        setData();
        testWidget.onSubmitClick();

        var data = testWidget.getData('health')[0];
        expect(data.COLLECTION_PART).toEqual(part);
      });
      it('clears the dialog', function () {
        spyOn(testWidget, 'clearValues');

        testWidget.onSubmitClick();

        expect(testWidget.clearValues).toHaveBeenCalled();
      });
    });
    describe('clearValues', function () {
      var fn = config.fieldNames.diet;

      beforeEach(function () {
        $(testWidget.health.domNode).find('select').combobox();
      });

      it('clears diet grid', function () {
        testWidget.addRow();
        testWidget.grid.collection.data[0][fn.CLASS] = 'blah';
        testWidget.addRow();

        testWidget.clearValues();

        expect(testWidget.grid.collection.data.length).toBe(0);
      });
      it('clears any tags', function () {
        spyOn(testWidget.tagsContainer.addBtnWidgets[0], 'clearValues');
        testWidget.tagsContainer.addAddBtnWidget();

        testWidget.clearValues();

        expect(testWidget.tagsContainer.addBtnWidgets.length).toBe(1);
      });
      it('clears health values', function () {
        spyOn(testWidget.health, 'clearValues');

        testWidget.clearValues();

        expect(testWidget.health.clearValues).toHaveBeenCalled();
      });
    });
    describe('getData', function () {
      beforeEach(function () {
        $(testWidget.health.domNode).find('select').combobox();
      });
      it('returns a record set object', function () {
        testWidget.currentFishId = '123';
        spyOn(testWidget, 'getGridData').and.returnValue([1]);
        testWidget.onSubmitClick();
        var data = testWidget.getData('diet');

        expect(data.length).toBe(1);
      });
    });
    describe('clear', function () {
      it('clears all of the stored data for this widget', function () {
        const populatedObject = { a: 1 };
        const emptyJson = '{}';

        testWidget.dietData = populatedObject;
        testWidget.tagsData = populatedObject;
        testWidget.healthData = populatedObject;

        testWidget.clear();

        expect(JSON.stringify(testWidget.dietData)).toEqual(emptyJson);
        expect(JSON.stringify(testWidget.tagsData)).toEqual(emptyJson);
        expect(JSON.stringify(testWidget.healthData)).toEqual(emptyJson);
      });
    });
    describe('removeFish', function () {
      it('removes all data associated with the fish', function () {
        const populatedObject = { a: 1, b: 2 };
        const bOnlyJson = '{"b":2}';

        testWidget.dietData = populatedObject;
        testWidget.tagsData = populatedObject;
        testWidget.healthData = populatedObject;

        testWidget.removeFish('a');

        expect(JSON.stringify(testWidget.dietData)).toEqual(bOnlyJson);
        expect(JSON.stringify(testWidget.tagsData)).toEqual(bOnlyJson);
        expect(JSON.stringify(testWidget.healthData)).toEqual(bOnlyJson);
      });
      it('can handle fish ids for which there is no data', function () {
        const populatedObject = { a: 1, b: 2 };
        const unchangedJson = '{"a":1,"b":2}';

        testWidget.dietData = populatedObject;
        testWidget.tagsData = populatedObject;
        testWidget.healthData = populatedObject;

        testWidget.removeFish('c');

        expect(JSON.stringify(testWidget.dietData)).toEqual(unchangedJson);
        expect(JSON.stringify(testWidget.tagsData)).toEqual(unchangedJson);
        expect(JSON.stringify(testWidget.healthData)).toEqual(unchangedJson);
      });
    });
  });
});
