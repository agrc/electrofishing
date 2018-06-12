define([
    'app/config',

    'dojo/on',
    'dojo/query',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'localforage'
], function (
    config,

    on,
    query,
    topic,
    declare,
    lang,

    localforage
) {
    return declare([], {
        // inputs: InputDomNode[]
        //      inputs that need to be cached
        inputs: null,

        // missingCacheIdError: String
        //      summary
        missingCacheIdError: 'Object property "cacheId" is required!',


        // passed in via constructor

        // cacheId: String
        //      The unique id associated with this object that is used as a key for local data caching
        cacheId: null,

        postCreate: function () {
            // summary:
            //      set up
            console.log('app/_InProgressCacheMixin:postCreate', arguments);

            if (this.cacheId === null || this.cacheId === undefined) {
                throw new Error(this.missingCacheIdError);
            }

            var that = this;
            var txt = 'input[data-dojo-attach-point], textarea[data-dojo-attach-point], select[data-dojo-attach-point]';
            this.inputs = query(txt, this.domNode)
                // don't return inputs from nested widgets
                .filter(function filter(node) {
                    return that.hasOwnProperty(node.dataset.dojoAttachPoint);
                });
            this.inputs.on('change', lang.hitch(this, 'cacheInProgressData'));

            // boostrap comobox selects need to be wired via jquery
            this.inputs.forEach(function wirejQueryEvent(node) {
                if (node.tagName === 'SELECT') {
                    $(node).on('change', lang.hitch(that, 'cacheInProgressData'));
                }
            });

            // don't run this in jasmine tests
            if (!window.jasmine) {
                this.hydrateWithInProgressData();
            }

            this.inherited(arguments);
        },
        hydrateWithInProgressData: function () {
            // summary:
            //      populates the controls with in progress cached data
            console.log('app/_InProgressCacheMixin:hydrateWithInProgressData', arguments);

            var that = this;

            return localforage.getItem(`${this.cachePrefix}_${this.cacheId}`).then(function (inProgressData) {
                if (inProgressData) {
                    that.inputs.forEach(function (node) {
                        if (node.dataset.dojoAttachPoint in inProgressData) {
                            if (node.tagName === 'SELECT' && node.children.length === 0) {
                                node.dataset[config.tempValueKey] = inProgressData[node.dataset.dojoAttachPoint];
                            } else {
                                node.value = inProgressData[node.dataset.dojoAttachPoint];
                            }

                            // fire onchange for inputs involved with NumericInputValidator
                            on.emit(node, 'change', {bubbles: false});

                            if (node.tagName === 'SELECT') {
                                $(node).combobox('refresh');
                            }
                        }
                    });
                }

                return inProgressData;
            }, lang.partial(lang.hitch(this, 'onError'), 'populating controls from cache.'));
        },
        cacheInProgressData: function () {
            // summary:
            //      caches any relevant data for an in progress report to localforage
            console.log('app/_InProgressCacheMixin:cacheInProgressData', arguments);

            var data = {};
            this.inputs.forEach(function (node) {
                data[node.dataset.dojoAttachPoint] = (node.type === 'number') ? parseFloat(node.value) : node.value;
            });

            data = lang.mixin(data, this.getAdditionalCacheData());

            return localforage.setItem(`${this.cachePrefix}_${this.cacheId}`, data)
                .then(null, lang.partial(lang.hitch(this, 'onError'), 'caching data.'));
        },
        onError: function (error, message) {
            // summary:
            //      error from localforage
            // error: Error
            console.log('app/_InProgressCacheMixin:onError', arguments);

            topic.publish(config.topics.toaster, 'Error ' + message + ' ' + error.message);
        },
        getAdditionalCacheData: function () {
            // summary:
            //      implemented by the child class to add additional data to the cache
            console.log('app/_InProgressCacheMixin:getAdditionalCacheData', arguments);

            return {};
        }
    });
});
