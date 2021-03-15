define(['dojo/_base/declare', 'pubsub-js'], function (
  declare,

  pubSub
) {
  return declare([], {
    // track all subscriptions for this class
    _subscriptions: null,

    constructor() {
      this._subscriptions = [];
    },

    addSubscription(token) {
      this._subscriptions.push(token);
    },

    destroy() {
      this._subscriptions.forEach((token) => pubSub.unsubscribe(token));

      this.inherited(arguments);
    },
  });
});
