define([
    './config'
], function (config) {
    return {
        loadApp: function (context) {
            console.log(context.name);
            return context.remote
                .get(require.toUrl(config.baseUrl))
                .waitForElementByCssSelector('body.loaded', 5000)
            ;
        },
        goToCatchTab: function (context) {
            return this.loadApp(context)
                .elementByCssSelector('a[href="#catchTab"]')
                    .clickElement()
                    .end()
                    .wait(250) // tab animation
            ;
        }
    };
});