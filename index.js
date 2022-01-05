const axios = require("axios");
const cheerio = require("cheerio");
// const pretty = require("pretty");
const fs = require("fs");
const puppeteer = require("puppeteer");

// URL of the page we want to scrape
let fileName = 'maszyny-rolnicze';
const url = `https://www.otomoto.pl/${fileName}`;

// Async function which scrapes the data
async function scrapeData() {
    try {
      // Fetch HTML of the page we want to scrape
      const { data } = await axios.get(url);

      // Load HTML we fetched in the previous line
      const $ = cheerio.load(data);

      // Select all the list items in plainlist class
      const listItems = $(".plainlist ul li");

      // Stores data for all countries
      const countries = [];

      // Use .each method to loop through the li we selected
      listItems.each((idx, el) => {
        // Object holding data for each country/jurisdiction
        const country = { name: "", iso3: "" };
        // Select the text content of a and span elements
        // Store the textcontent in the above object
        country.name = $(el).children("a").text();
        country.iso3 = $(el).children("span").text();
        // Populate countries array with country data
        countries.push(country);
      });
      // Logs countries array to the console
      console.dir(countries);
      // Write countries array in countries.json file
      fs.writeFile("coutries.json", JSON.stringify(countries, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Do puppeteer
  async function doPuppeteer() {
      const browser = await puppeteer.launch();
      try {
        const page = await browser.newPage();
        await page.goto(url);
        await page.screenshot({ path:'puppet.png' });

        const pageData = await page.evaluate(() => {
            return {
                // html: document.querySelector('.optimus-app-p2z5vl.e19uumca5').innerHTML,
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

  // Invoke the above function
  // scrapeData();
  doPuppeteer();