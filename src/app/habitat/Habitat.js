define([
    'app/config',
    'app/Domains',
    'app/helpers',
    'app/_ClearValuesMixin',
    'app/_InProgressCacheMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/DeferredList',
    'dojo/dom-class',
    'dojo/query',
    'dojo/text!./templates/Habitat.html',
    'dojo/_base/declare'
], function (
    config,
    Domains,
    helpers,
    _ClearValuesMixin,
    _InProgressCacheMixin,

    _TemplatedMixin,
    _WidgetBase,

    DeferredList,
    domClass,
    query,
    template,
    declare
) {
    // summary:
    //      Habitat tab
    return declare([_WidgetBase, _TemplatedMixin, _ClearValuesMixin, _InProgressCacheMixin], {
        templateString: template,
        baseClass: 'habitat',

        // cacheId: String
        //      used by _InProgressCacheMixin
        cacheId: 'app/habitat',

        // badSedClassesErrMsg: String
        //      error message when the sed classes don't add up to 100
        badSedClassesErrMsg: 'Sediment Class Percentages must add up to 100!',


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/habitat/Habitat:postCreate', arguments);

            var that = this;
            var lst = new DeferredList([
                Domains.populateSelectWithDomainValues(this.springSelect,
                    config.urls.habitatFeatureService,
                    config.fieldNames.habitat.SPNG),
                Domains.populateSelectWithDomainValues(this.overstorySelect,
                    config.urls.habitatFeatureService,
                    config.fieldNames.habitat.DOVR),
                Domains.populateSelectWithDomainValues(this.understorySelect,
                    config.urls.habitatFeatureService,
                    config.fieldNames.habitat.DUND)
            ]);
            lst.then(function () {
                $(that.domNode).find('select').combobox();
            });

            this.inherited(arguments);
        },
        clear: function () {
            // summary:
            //      resets all controls
            console.log('app/habitat/Habitat:clear', arguments);

            this.clearValues();

            this.onSedimentClassChange();
        },
        isValid: function () {
            // summary:
            //      Supposed to check for required values. But this tab currently
            //      has no required values.
            console.log('app/habitat/Habitat:isValid', arguments);

            var total = parseInt(this.sedTotalSpan.innerHTML, 10);

            if (total === 0 || total === 100) {
                return true;
            } else {
                return this.badSedClassesErrMsg;
            }
        },
        getData: function () {
            // summary:
            //      Builds a record set object suitable for submitting to the
            //      NewCollectionEvent service
            console.log('app/habitat/Habitat:getData', arguments);

            var f = {};
            var fn = config.fieldNames.habitat;

            f[fn.EVENT_ID] = config.eventId;
            f[fn.BANKVEG] = helpers.getNumericValue(this.bankVegTxt.value);
            f[fn.BWID] = helpers.getNumericValue(this.bankfulWidthTxt.value);
            f[fn.DEPTR] = helpers.getNumericValue(this.depthRightThirdTxt.value);
            f[fn.DEPTL] = helpers.getNumericValue(this.depthLeftThirdTxt.value);
            f[fn.DEPM] = helpers.getNumericValue(this.depthMidChannelTxt.value);
            f[fn.DEPMAX] = helpers.getNumericValue(this.maxDepthTxt.value);
            f[fn.DOVR] = this.overstorySelect.value;
            f[fn.DUND] = this.understorySelect.value;
            f[fn.LGWD] = helpers.getNumericValue(this.largeWoodyDebrisTxt.value);
            f[fn.POOL] = helpers.getNumericValue(this.poolAreaTxt.value);
            f[fn.SPNG] = this.springSelect.value;
            f[fn.RIFF] = helpers.getNumericValue(this.riffleAreaTxt.value);
            f[fn.RUNA] = helpers.getNumericValue(this.runAreaTxt.value);
            f[fn.SUB_FINES] = helpers.getNumericValue(this.finesTxt.value);
            f[fn.SUB_SAND] = helpers.getNumericValue(this.sandTxt.value);
            f[fn.SUB_GRAV] = helpers.getNumericValue(this.gravelTxt.value);
            f[fn.SUB_COBB] = helpers.getNumericValue(this.cobbleTxt.value);
            f[fn.SUB_RUBB] = helpers.getNumericValue(this.rubbleTxt.value);
            f[fn.SUB_BOUL] = helpers.getNumericValue(this.boulderTxt.value);
            f[fn.SUB_BEDR] = helpers.getNumericValue(this.bedrockTxt.value);
            f[fn.VEGD] = helpers.getNumericValue(this.vegDensityTxt.value);
            f[fn.WWID] = helpers.getNumericValue(this.wettedWidthTxt.value);
            f[fn.SIN] = helpers.getNumericValue(this.sinuosityTxt.value);
            f[fn.VEL] = helpers.getNumericValue(this.waterVelocityTxt.value);
            f[fn.EROS] = helpers.getNumericValue(this.banksErodingTxt.value);
            f[fn.TEMP] = helpers.getNumericValue(this.waterTempTxt.value);
            f[fn.PH] = helpers.getNumericValue(this.acidityTxt.value);
            f[fn.CON] = helpers.getNumericValue(this.conductivityTxt.value);
            f[fn.OXYGEN] = helpers.getNumericValue(this.oxygenTxt.value);
            f[fn.SOLIDS] = helpers.getNumericValue(this.solidsTxt.value);
            f[fn.TURBIDITY] = helpers.getNumericValue(this.turbidityTxt.value);
            f[fn.ALKALINITY] = helpers.getNumericValue(this.alkalinityTxt.value);
            return [f];
        },
        onSedimentClassChange: function () {
            // summary:
            //      fires when a change has been made to any of the six
            //      sediment classes
            //      Adds up the classes and applies the appropriate color to the total
            console.log('app/habitat/Habitat:onSedimentClassChange', arguments);

            var total = 0;
            query('.panel-body .form-group input', this.domNode).forEach(function (node) {
                if (node.value !== '') {
                    total = total + parseInt(node.value, 10);
                }
            });
            this.sedTotalSpan.innerHTML = total;

            // update color of badge
            var parentDiv = this.sedTotalSpan.parentElement;
            if (total === 100) {
                domClass.add(parentDiv, 'text-success');
                domClass.remove(parentDiv, 'text-danger');
            } else if (total === 0) {
                domClass.remove(parentDiv, 'text-danger');
                domClass.remove(parentDiv, 'text-success');
            } else {
                domClass.add(parentDiv, 'text-danger');
                domClass.remove(parentDiv, 'text-success');
            }
        }
    });
});
