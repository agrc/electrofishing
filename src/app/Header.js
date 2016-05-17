define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/Header.html',
    'dojo/_base/event',
    'dojo/topic',
    'dojo/on'
],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    event,
    topic,
    on
    ) {
    return declare('app.Header', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'header',

        constructor: function () {
            // summary:
            //    description
            console.log('app/Header:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/Header:postCreate', arguments);

            // set version number
            this.version.innerHTML = AGRC.version;

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires the events for the object
            console.log('app/Header:wireEvents', arguments);

            this.connect(this.title, 'click', 'onGoHome');
            this.own(
                on(this.submitBtn, 'click', function () {
                    topic.publish(AGRC.topics.onSubmitReportClick);
                }),
                on(this.cancelBtn, 'click', function () {
                    topic.publish(AGRC.topics.onCancelReportClick);
                })
            );
        },
        onGoHome: function (evt) {
            // summary:
            //      fires when the user clicks the title or home links
            // evt: onclick event
            console.log('app/Header:onGoHome', arguments);

            event.stop(evt);
        }
    });
});
