const browserObj = require('./bonus/browser');
const controller = require('./bonus/controller');

let browserIns = browserObj.initiateBrowser();
controller(browserIns);
