define([
  'react-app/config',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',

  'dojo/text!./templates/NoFishException.html',
  'dojo/_base/declare',

  'pubsub-js',
], function (
  config,

  _TemplatedMixin,
  _WidgetBase,

  template,
  declare,

  topic
) {
  // TODO: remove once this module is converted to a component
  config = config.default;

  // summary:
  //      Container widget for Tag widgets.
  return declare([_WidgetBase, _TemplatedMixin], {
    widgetsInTemplate: true,
    templateString: template,
    baseClass: 'no-fish-exception',

    constructor: function () {
      console.log('app/catch/NoFishException:constructor', arguments);
    },
    allowSkip: function (event) {
      // summary:
      //      publish a topic to allow validation to be skipped for not finding a fish
      console.info('app/catch/NoFishException:AllowSkip', arguments);

      topic.publishSync(config.topics.noFish, event.target.checked);
    },
  });
});
