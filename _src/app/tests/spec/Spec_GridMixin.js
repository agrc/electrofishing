require(['app/_GridMixin', 'dijit/_WidgetBase', 'dojo/dom-construct', 'dojo/_base/declare'], function (
  _GridMixin,

  _WidgetBase,

  domConstruct,
  declare
) {
  describe('app/_GridMixin', function () {
    var testObject;
    var skipCol = 'SKIPME';
    beforeEach(function () {
      testObject = new (declare([_WidgetBase, _GridMixin], {
        idProperty: 'ID',
        firstColumn: 'ID',
        ignoreColumn: skipCol,
        postCreate: function () {
          var columns = ['ID', 'TEST', 'TEST2', skipCol];
          this.initGrid(columns);
          this.setGridData([
            {
              ID: '1',
              TEST: 'test value',
              TEST2: 'test value 2',
              SKIPME: 'skip this',
            },
            {
              ID: '2',
              TEST: 'test value',
              TEST2: 'test value 2',
              SKIPME: 'skip this',
            },
          ]);
        },
      }))({}, domConstruct.create('div', null, document.body));
      testObject.startup();
    });
    afterEach(function () {
      testObject = null;
    });
    describe('getGridData', function () {
      it('filters out ignore fields', function () {
        var data = [
          {
            ID: '1',
            TEST: 'test value',
            TEST2: 'test value 2',
          },
          {
            ID: '2',
            TEST: 'test value',
            TEST2: 'test value 2',
          },
        ];
        expect(JSON.stringify(testObject.getGridData())).toEqual(JSON.stringify(data));
      });
      it('can handle no ignore column', function () {
        var data = [
          {
            ID: '1',
            TEST: 'test value',
            TEST2: 'test value 2',
            SKIPME: 'skip this',
          },
          {
            ID: '2',
            TEST: 'test value',
            TEST2: 'test value 2',
            SKIPME: 'skip this',
          },
        ];
        testObject.ignoreColumn = null;
        expect(JSON.stringify(testObject.getGridData())).toEqual(JSON.stringify(data));
      });
    });
  });
});
