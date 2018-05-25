const puppeteer = require('puppeteer');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

describe('SubmitReport', function () {
    let browser;
    let page;
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: !process.env.DEBUG, slowMo: 200 });
        page = await browser.newPage();
        await page.setViewport({ width: 1000, height: 1200 });
    });

    beforeEach(async () => {
        await page.goto('http://localhost/projects/electrofishing/src/');
    });

    it('page loads', async () => {
        await page.waitForSelector('body.loaded');
    });

    it('submit report', async () => {
        await page.waitForSelector('body.loaded');

        // select station
        await page.click('.leaflet-marker-icon');

        // select start & end points
        const [start, end] = await page.$$('.start-end-geodef [data-dojo-attach-point="mapBtn"]');

        await start.click();
        await page.click('[data-dojo-attach-point="mapDiv"]');

        await end.click();
        await page.evaluate(() => {
            const offset = 20;
            const config = require('app/config');
            config.app.newEvent.locationTb.verifyMap.map.panBy([offset, offset]);
        });
        await page.click('[data-dojo-attach-point="mapDiv"]');

        await page.click('[data-dojo-attach-point="verifyMapBtn"]');

        await page.waitForSelector('[data-dojo-attach-point="verifyMapBtn"][data-successful="true"]');

        await page.type('[data-dojo-attach-point="dateTxt"]', '03/15/2018');

        await page.type('[data-dojo-attach-point="weatherSelect"]', 's');

        await page.click('a[href="#methodTab"]');

        await page.type('[data-dojo-attach-point="numberNettersTxt"]', '3');

        const numAnodesTxt = await page.$('[data-dojo-attach-point="numberAnodesTxt"]');
        await numAnodesTxt.click({ clickCount: 3 });
        await numAnodesTxt.type('2');

        const firstCell = await page.$('.equipment .dgrid-scroller table td.field-ANODE_DIAMETER');
        await firstCell.click();
        await firstCell.type('1');

        await page.keyboard.press('Tab');
        await page.keyboard.type('1');
        await page.keyboard.press('Tab');
        await page.keyboard.type('2');
        await page.keyboard.press('Tab');
        await page.keyboard.type('2');

        await page.click('a[href="#catchTab"]');

        const firstCatchCell = await page.$('.catch .dgrid-scroller table td.field-SPECIES_CODE');
        await firstCatchCell.click();
        await firstCatchCell.type('B');
        await page.keyboard.press('Tab');
        await page.keyboard.type('s');
        await page.keyboard.press('Tab');
        await page.keyboard.type('1');
        await page.keyboard.press('Tab');
        await page.keyboard.type('1');

        await page.click('[data-dojo-attach-point="submitBtn"]');
        await page.click('[data-testid="summaryConfirmBtn"]');

        await page.waitForSelector('[data-dojo-attach-point="successMsgContainer"]:not(.hidden)');
        //
        // await new Promise((resolve) => {
        //     setTimeout(resolve, 50000);
        // });
    });

    afterAll(async () => {
        if (!process.env.DEBUG) {
            await browser.close();
        }
    });
});
