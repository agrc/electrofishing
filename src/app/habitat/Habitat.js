define([
    'app/Domains',
    'app/_ClearValuesMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/DeferredList',
    'dojo/dom-class',
    'dojo/query',
    'dojo/text!./templates/Habitat.html',
    'dojo/_base/declare'
], function (
    Domains,
    _ClearValuesMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    DeferredList,
    domClass,
    query,
    template,
    declare
) {
    // summary:
    //      Habitat tab
    return declare('app/habitat/Habitat', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ClearValuesMixin], {
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'habitat',

        // badSedClassesErrMsg: String
        //      error message when the sed classes don't add up to 100
        badSedClassesErrMsg: 'Sediment Class Percentages must add up to 100!',


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            var that = this;
            var lst = new DeferredList([
                Domains.populateSelectWithDomainValues(this.springSelect,
                    AGRC.urls.habitatFeatureService,
                    AGRC.fieldNames.habitat.SPNG),
                Domains.populateSelectWithDomainValues(this.overstorySelect,
                    AGRC.urls.habitatFeatureService,
                    AGRC.fieldNames.habitat.DOVR),
                Domains.populateSelectWithDomainValues(this.understorySelect,
                    AGRC.urls.habitatFeatureService,
                    AGRC.fieldNames.habitat.DUND)
            ]);
            lst.then(function () {
                $(that.domNode).find('select').combobox();
            });
        },
        clear: function () {
            // summary:
            //      resets all controls
            console.log(this.declaredClass + '::clear', arguments);

            this.clearValues();

            this.onSedimentClassChange();
        },
        isValid: function () {
            // summary:
            //      Supposed to check for required values. But this tab currently
            //      has no required values.
            console.log(this.declaredClass + '::isValid', arguments);

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
            console.log(this.declaredClass + '::getData', arguments);

            var f = {};
            var fn = AGRC.fieldNames.habitat;

            f[fn.EVENT_ID] = AGRC.eventId;
            f[fn.BANKVEG] = this.bankVegTxt.value;
            f[fn.BWID] = this.bankfulWidthTxt.value;
            f[fn.DEPTR] = this.depthRightThirdTxt.value;
            f[fn.DEPTL] = this.depthLeftThirdTxt.value;
            f[fn.DEPM] = this.depthMidChannelTxt.value;
            f[fn.DEPMAX] = this.maxDepthTxt.value;
            f[fn.DOVR] = this.overstorySelect.value;
            f[fn.DUND] = this.understorySelect.value;
            f[fn.LGWD] = this.largeWoodyDebrisTxt.value;
            f[fn.POOL] = this.poolAreaTxt.value;
            f[fn.SPNG] = this.springSelect.value;
            f[fn.RIFF] = this.riffleAreaTxt.value;
            f[fn.RUNA] = this.runAreaTxt.value;
            f[fn.SUB_FINES] = this.finesTxt.value;
            f[fn.SUB_SAND] = this.sandTxt.value;
            f[fn.SUB_GRAV] = this.gravelTxt.value;
            f[fn.SUB_COBB] = this.cobbleTxt.value;
            f[fn.SUB_RUBB] = this.rubbleTxt.value;
            f[fn.SUB_BOUL] = this.boulderTxt.value;
            f[fn.VEGD] = this.vegDensityTxt.value;
            f[fn.WWID] = this.wettedWidthTxt.value;
            f[fn.SIN] = this.sinuosityTxt.value;
            f[fn.VEL] = this.waterVelocityTxt.value;
            f[fn.EROS] = this.banksErodingTxt.value;
            f[fn.TEMP] = this.waterTempTxt.value;
            f[fn.PH] = this.acidityTxt.value;
            f[fn.CON] = this.conductivityTxt.value;
            return {
                displayFieldName: '',
                features: [{attributes: f}]
            };
        },
        onSedimentClassChange: function () {
            // summary:
            //      fires when a change has been made to any of the six
            //      sediment classes
            //      Adds up the classes and applies the appropriate color to the total
            console.log(this.declaredClass + '::onSedimentClassChange', arguments);

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
