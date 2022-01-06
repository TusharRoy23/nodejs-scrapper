const puppeteer = require("puppeteer");

async function initiateBrowser() {
    let browser;
    try {
        console.log('The browser is opening...');
        browser = await puppeteer.launch({
            defaultViewport: {
                width: 411,
                height: 731,
                isMobile: true,
            }
        });
        
    } catch (error) {
        console.log('error of browser instance: ', error);
    }
    return browser;
}
module.exports = {
    initiateBrowser
};