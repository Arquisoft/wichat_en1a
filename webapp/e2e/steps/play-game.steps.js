const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/play-game.feature');

let page;
let browser;

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 1 });
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
      username = "paco"
      password = "Paco15&asw"
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
      await page.waitForSelector('h2[id="gameQuestion"]',{visible: true,timeout: 5000});//wait for any game question 
    });
    when('I play the game', async ()=>{
      await expect(page).toClick('button[id="gameAnswer0"]');
      for(let i=0;i<9;i++){
        const imageCurrent = await page.$eval('img[alt="question hint image"]', (img) => img.src);
        await page.waitForFunction(
          (imageCurrent) => {
            const image = document.querySelector('img[alt="question hint image"]');
            if(image){
              return image.src !== imageCurrent;
            }
            return false;  // Check if the image source changes
          },
          { timeout: 5000 },imageCurrent
        );
        await expect(page).toClick('button[id="gameAnswer0"]');
      }
      await page.waitForSelector('h2[id="results-title"]');
    });
    then("I see my game's statistics", async ()=>{
      await expect(page).toMatchElement('td[id="score-gameStat"]');
      await expect(page).toMatchElement('td[id="gameMode-gameStat"]');
      await expect(page).toMatchElement('td[id="questionsPassed-gameStat"]');
      await expect(page).toMatchElement('td[id="questionsFailed-gameStat"]');
      await expect(page).toMatchElement('td[id="accuracy-gameStat"]');
    });
    then('I logout sucessfuly', async ()=>{
      await expect(page).toClick('button[id="logoutButton"]');
      await page.waitForSelector('h2[id="index-title"]');
    });
  })

  afterAll(async ()=>{
    browser.close()
  })

});