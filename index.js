
const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");

// URL of the page we want to scrape
let fileName = 'maszyny-rolnicze';
const url = `https://www.otomoto.pl/${fileName}`;


  // Do puppeteer
  async function doPuppeteer() {
      const browser = await puppeteer.launch();
      try {
        const page = await browser.newPage();
        await page.goto(url);
        await page.screenshot({ path:'puppet.png' });

        const pageData = await page.evaluate(() => {
            return {
                html: document.querySelector('main').innerHTML,
            }
        });
        var adds = [];
        const $ = cheerio.load(pageData.html);
        $('article').each((_, element) => {
            adds.push({
                name: $(element).find('h2 > a').text(),
                price: $(element).find('.e1b25f6f9').text(),
                link: $(element).find('h2 > a').attr('href'),
            });
        });
        await browser.close();

        const sp = fileName.split('/');
        fileName = sp.length > 1 ? `${sp[0]}-${sp[1]}` : sp[0];
        fs.writeFile(`${fileName}.json`, JSON.stringify(adds, null, 2), (err) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log("Successfully written data to file");
        });
        
      } catch (error) {
          console.error('error: ', error);
          await browser.close();
      }
  }

  doPuppeteer();