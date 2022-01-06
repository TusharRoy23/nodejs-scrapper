const pageScraper = require('./page-scraper');

async function scrapeAll(browserIns) {
    try {
        const browser = await browserIns;
        await pageScraper.scraper(browser);
    } catch (error) {
        console.log('error in browser instance: ', error);
    }
};

module.exports = (browserIns) => scrapeAll(browserIns);