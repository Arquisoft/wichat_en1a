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
      : await puppeteer.launch({ headless: true, slowMo: 1 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 10000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('The user is not registered in the site', ({given,when,then}) => {
    
    let username;
    let password;
    
    given('An unregistered user', async () => {
      username = "pablo"
      password = "Pablo15&asw"
      await expect(page).toClick('a[name="signup"]');
      await page.waitForSelector('input[name="username"]');//wait for redirection
    });
    
    when('I fill the data in the form and press submit', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toFill('input[name="repeatPassword"]', password);
      await expect(page).toClick('button[name="addUserButton"]');
    });
    
    then('I am redirected to the login page', async () => {
      await page.waitForSelector('button[name="loginButton"]');//wait for redirection
    });
  })
  
  test('The user is registered in the site', ({given,when,then}) => {
    
    let username;
    let password;
    
    given('A registered user', async () => {
      username = "pablo"
      password = "Pablo15&asw"
      await page.waitForSelector('input[name="username"]');//wait for redirection
    });
    
    when('I fill the data in the login form and press submit', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button[name="loginButton"]');
    });
    
    then('I am redirected to the home page', async () => {
      await page.waitForSelector('h1[id="home-title"]');//wait for redirection
    });
  })

  afterAll(async ()=>{
    browser.close()
  })

});