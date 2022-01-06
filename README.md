# nodejs-scrapper
A simple application for scrapping a site using nodejs, puppeteer, cheerio

# Running the app
```bash
# install node_module
$ npm install

# run the exercise
$ npm run start

# run the bonus exercise
$ npm run bonus
```

# Questions/thoughts
## 1. Ideas for error catching/solving, retry strategies?
```bash
Catching error is important when an application is specially working with network connection. 
In that case if any issue occured with network connection at least application could do the other task. 
And retry strategy is necessary for calling a falied/dropped request for certain number of tries.
```
## 2. Accessing more ads from this link than the limit allows (max 50 pages)?
```bash
In this case, If we call more than the limit then this application will send response with the maximum page 
limit. And it is unnecessary to call beyond the limit.
```
## 3. Experience with CI/CD tools?
```bash
No prior knowledge.
```
## 4. Other considerations?
```bash
For version controlling, better to use Git.
For faster development using node.js better to use frameworks like express/nest.js
```
