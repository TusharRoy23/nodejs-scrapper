const cheerio = require("cheerio");
const fs = require("fs");
const retry = require('async-retry');
const puppeteer = require('puppeteer');
const iPhoneX = puppeteer.devices['iPhone X'];
let ads = [];

const scraperObj = {
    url: 'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc',
    async scraper(browser) {
        try {
            let page = await browser.newPage();
            console.log(`Navigating to ${this.url}`);
            await page.goto(this.url);

            const pageData = await page.evaluate(() => {
                return {
                    html: document.querySelector('main').innerHTML,
                    paginate: document.querySelector('.pagination-list').innerHTML,
                    totalAds: document.querySelector('.e1l24m9v0.optimus-app-xeol1s-Text.eu5v0x0').innerHTML
                }
            });

            getTotalAdsCount(cheerio.load(pageData.totalAds));
            
            addItems(pageData.html);
            let isTruckIitem = cheerio.load(pageData.totalAds).text().split(' ')[0] === 'Ciężarowe';

            let totalPage = 0;
            const $ = cheerio.load(pageData.paginate);
            $('li a span').each((_, element) => {
                totalPage = $(element).text();
            });

            for (let index = 1; index <= totalPage; index++) {
                try {
                    let pages = await browser.newPage();
                    console.log(`Navigating to ${this.url}&page=${index}`);
                    await pages.goto(this.url + `&page=${index}`);

                    await getNextPageUrl(pages);
                } catch (error) {
                    await retry(
                        async (_) => {
                            let page = await browser.newPage();
                            console.log(`Retry Navigating to ${this.url}&page=${index}`);
                            await page.goto(this.url + `&page=${index}`);

                            await getNextPageUrl(page);
                        },
                        {
                            retries: 3
                        }
                    );
                }
            }

            let truckList = [];

            if (ads.length && isTruckIitem) {
                for (const item of ads) {
                    try {
                        let pages = await browser.newPage();
                        console.log(`TruckItem: Navigating to ${item.link}`);
                        await pages.goto(item.link);

                        let result = await scrapeTruckItem(pages);
                        truckList.push({
                            id: item.id,
                            title: item.name,
                            price: item.price,
                            production_year: result.production_year,
                            registration_date: result.registration_date,
                            power: result.power,
                            mileage: result.mileage
                        });
                    } catch (error) {
                        await retry(
                            async (_) => {
                                let pages = await browser.newPage();
                                console.log(`TruckItem: Retry Navigating to ${item.link}`);
                                await pages.goto(item.link);

                                let result = await scrapeTruckItem(pages);
                                truckList.push({
                                    id: item.id,
                                    title: item.name,
                                    price: item.price,
                                    production_year: result.production_year,
                                    registration_date: result.registration_date,
                                    power: result.power,
                                    mileage: result.mileage
                                });
                            },
                            {
                                retries: 3
                            }
                        );
                    }
                }
            }
            await browser.close();
            generateFile(ads, 'all-product');
            generateFile(truckList, 'truck-item');

        } catch (error) {
            console.log('error: ', error);
            await browser.close();
        }
    }
};

function getTotalAdsCount(value) {
    // first removing the space from string & then picking the number
    let totalAds = value.text().replace(/\s/g, '').match(/(\d+)/)[0];
    console.log('totalAds: ', totalAds);
}

async function scrapeTruckItem(page) {
    return new Promise(async(resolve, reject) => {
        const pageData = await page.evaluate(() => {
            return {
                html: document.querySelector('#parameters').innerHTML,
            }
        });
        resolve(pageData);
    })
    .then((result) => {
        const $ = cheerio.load(result.html);
        return {
            production_year: $('span:contains("Rok produkcji")').next().text().trim(),
            registration_date: $('span:contains("Pierwsza rejestracja")').next().text().trim(),
            power: $('span:contains("Moc")').next().text().trim(),
            mileage: $('span:contains("Pojemność skokowa")').next().text().trim()
        };
    })
    .catch((error) => {
        console.log('res error: ', error);
        doRetry(page, true);
    });
}

function addItems(pageData) {
    const $ = cheerio.load(pageData);
    $('article').each((_, element) => {
        console.log($(element).attr('id'));
        console.log($(element).find('h2 > a').attr('href'));
    });
}

async function getNextPageUrl(page) {
    return new Promise(async(resolve, reject) => {

        const pageData = await page.evaluate(() => {
            return {
                html: document.querySelector('main').innerHTML,
            }
        });
        resolve(pageData);
    })
    .then((result) => {
        const $ = cheerio.load(result.html);
        let value = [];
        $('article').each((_, element) => {
            value.push({
                id: $(element).attr('id'),
                name: $(element).find('h2 > a').text(),
                price: $(element).find('.e1b25f6f9').text(),
                link: $(element).find('h2 > a').attr('href'),
            });
        });
        ads.push(...value);
    })
    .catch((error) => {
        console.log('error: ', error);
        doRetry(page, false);
    })

}

async function doRetry(page, isTruckIitem) {
    await retry(
        async (_) => {
            if (isTruckIitem) {
                await scrapeTruckItem(page);
            } else {
                await getNextPageUrl(page);
            }
        },
        {
            retries: 3
        }
    );
}

function generateFile(ads, fileName) {
    fs.writeFile(`${fileName}.json`, JSON.stringify(ads, null, 2), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`File ${fileName}.json generated successfully`);
    });
}

module.exports = scraperObj;