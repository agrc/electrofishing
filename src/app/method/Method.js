define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/method/templates/Method.html',
    'dojo/string',
    'dojo/_base/array',
    'app/Domains',
    'dojo/query',
    'dojo/topic',
    'dojo/_base/lang',
    'app/_ClearValuesMixin',

    'app/method/BackpacksContainer',
    'app/method/CanoeBargesContainer',
    'app/method/RaftBoatsContainer'
],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    string,
    array,
    Domains,
    query,
    topic,
    lang,
    _ClearValuesMixin
    ) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ClearValuesMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'method',

        // requiredFields: Object[]
        //      An array of fields that need to be checked in isValid
        requiredFields: [
            ['voltsTxt', 'Voltage']
        ],

        // eventId: String (GUID)
        //      set by NewCollectionEvent
        eventId: null,


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            var that = this;

            Domains.populateSelectWithDomainValues(this.waveformSelect,
                AGRC.urls.samplingEventsFeatureService,
                AGRC.fieldNames.samplingEvents.WAVEFORM).then(function () {
                    $(that.domNode).find('select').combobox();
                });

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::wireEvents', arguments);

            topic.subscribe(AGRC.topics.onCathodeTypeChange, lang.hitch(this, this.onCathodeTypeChange));
        },
        isValid: function () {
            // summary:
            //      checks all required values
            // returns: String (error message) | Boolean (true if valid)
            console.log(this.declaredClass + '::isValid', arguments);

            function requireField(input, name) {
                if (input.value === '') {
                    return string.substitute(AGRC.missingRequiredFieldTxt, [name]);
                } else {
                    return true;
                }
            }

            var valid;
            var that = this;

            array.every(this.requiredFields, function (f) {
                valid = requireField(that[f[0]], f[1]);
            });

            return valid;
        },
        clear: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::clear', arguments);

            this.backpacksContainer.clear();
            this.canoeBargesContainer.clear();
            this.raftBoatsContainer.clear();

            this.clearValues();

            this.numberTxt.value = 1;
        },
        onCathodeTypeChange: function (value) {
            // summary:
            //      in charge of enabling or disabling the cathode diameter text box
            // value: String
            //      The new value of the cathode type select
            console.log(this.declaredClass + '::onCathodeTypeChange', arguments);

            if (value === 'b') {
                this.cathodeDiameterTxt.disabled = true;
                this.cathodeDiameterTxt.value = '';
            } else {
                this.cathodeDiameterTxt.disabled = false;
            }
        }
    });
});
