define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/on',
    'dojo/text!app/templates/Header.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/event'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    on,
    template,
    topic,
    declare,
    event
) {
    return declare([_WidgetBase, _TemplatedMixin], {
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
            this.version.innerHTML = config.version;

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires the events for the object
            console.log('app/Header:wireEvents', arguments);

            this.connect(this.title, 'click', 'onGoHome');
            this.own(
                on(this.submitBtn, 'click', function () {
                    topic.publish(config.topics.onSubmitReportClick);
                }),
                on(this.cancelBtn, 'click', function () {
                    topic.publish(config.topics.onCancelReportClick);
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
