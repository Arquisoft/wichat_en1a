const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register-form.feature');

let page;
let browser;

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 10000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('The user plays a basic game', ({given,when,then}) => {
    
    let username;
    let password;
    
    given('An unregistered user', async () => {
      username = "pablo"
      password = "Pablo15&asw"
      await expect(page).toClick('a[name="signup"]');
      await page.waitForSelector('input[name="username"]');//wait for redirection
    });
    
    when('I register correctly', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toFill('input[name="repeatPassword"]', password);
      await expect(page).toClick('button[name="addUserButton"]');
      await page.waitForSelector('button[name="loginButton"]');//wait for redirection
    });
    when('I login correctly', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button[name="loginButton"]');
      await page.waitForSelector('h1[id="home-title"]');//wait for redirection
    });
    when('I select the basic gamemode', async ()=>{
      await expect(page).toClick('a[id="basicQuizButton"]');
      await page.waitForSelector('h2[id="gameQuestion"]');//wait for any game question 
    });
    when('I play the game', async ()=>{
      for(let i=0;i<10;i++){
        await expect(page).toClick('button[id="gameAnswer0"]');
        const imageSelector = 'img[alt="question hint image"]';
        await page.waitForFunction(
          (imageSelector) => {
            const image = document.querySelector(imageSelector);
            return image && image.src !== 'no image';  // Check if the image source changes
          },
          { timeout: 2000 }, // Wait up to 30 seconds for the image to change
          imageSelector
        );
      }
      await page.waitForSelector('h2[id="results-title"]');
    });
    then("I see my game's statistics", async ()=>{
      await page.waitForSelector('td[id="score-gameStat"]');
      await page.waitForSelector('td[id="gameMode-gameStat"]');
      await page.waitForSelector('td[id="questionsPassed-gameStat"]');
      await page.waitForSelector('td[id="questionsFailed-gameStat"]');
      await page.waitForSelector('td[id="accuracy-gameStat"]');
    });
    then('I logout sucessfuly', async ()=>{
      await expect(page).toClick('button[')
    });
  })

  afterAll(async ()=>{
    browser.close()
  })

});