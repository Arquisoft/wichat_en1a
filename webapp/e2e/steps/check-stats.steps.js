const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const { register, login, selectGameMode, playBasicGame, seeGameStats, logout } = require('../helpers/helpers');
const feature = loadFeature('./features/check-stats.feature');
const en = require('../../src/locales/EN.json');

let browser, page;

let a; // Mock user object

defineFeature(feature, test => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 1 });
    page = await browser.newPage();
    a = { username: "testUserA", password: 'PasswordA123!' };
    setDefaultOptions({ timeout: 10000 })
    await register(page, a); // Register user A

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  afterAll(async () => {
    await browser.close();
  });

  test('A user without any game played tries to see his/her statistics', ({ given, when, then }) => {
    
    given('A registered user that exists in the database', async () => {
      await login(page, a);
      await logout(page);
    });

    when('The user logs in correctly', async () => {
      await login(page, a);
    });

    when('The user clicks the statistics in the navigation bar', async () => {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }), // or 'networkidle0' if needed
        expect(page).toClick('a[href="/stats"]'),
      ]);
    
      await page.waitForSelector('h1'); // wait for heading to be in the new page
      const title = await page.evaluate(() => document.querySelector('h1').innerText);
      expect(title).toBe(en["statistics.title"]);
    });

    then('The user is shown an informative message', async () => {
      const expectedText = en["statistics.noData"]; 
      const found = await page.evaluate((expectedText) => {
        return document.body.innerText.includes(expectedText);
      }, expectedText);
      expect(found).toBe(true);
    });

    then('The user logs out successfully', async () => {
      await logout(page);
    });
  });

  test('The user checks his/her personal statistics after a game is played', ({ given, when, then }) => {

    given('A registered user that exists in the database', async () => {
      await login(page, a);
      await logout(page);
    });

    when('The user logs in correctly', async () => {
      await login(page, a);
    });

    when('The user selects the basic game mode', async () => {
      await selectGameMode(page, "basicQuiz");
    });

    when('The user plays the game', async () => {
      await playBasicGame(page, 10);
    });

    then('The user sees the statistics of the game', async () => {
      await seeGameStats(page);
    });

    when('The user clicks the statistics in the navigation bar', async () => {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        expect(page).toClick('a[href="/stats"]'),
      ]);
    
      await page.waitForSelector('h1');
      const title = await page.evaluate(() => document.querySelector('h1').innerText);
      expect(title).toBe(en["statistics.title"]);
    });

    then('The user can see the statistics', async () => {
      const title = await page.evaluate(() => document.querySelector('h1').innerText);
      expect(title).toBe(en["statistics.title"]);

      const expectedTextOnScreen = en["statistics.answerDistribution"]; 
      const found = await page.evaluate((expectedTextOnScreen) => {
        return document.body.innerText.includes(expectedTextOnScreen);
      }, expectedTextOnScreen);
      expect(found).toBe(true);
    });

    then('The user can navigate through the three tabs of the statistics view', async () => {
      // Overview Tab
      // await page.click('button.overview'); // Click on the first tab (no need, as it's the default tab)
      const expectedTextOnOverviewTab = en["statistics.summary"]; 
      const found1 = await page.evaluate((expectedTextOnOverviewTab) => {
        return document.body.innerText.includes(expectedTextOnOverviewTab);
      }, expectedTextOnOverviewTab);
      expect(found1).toBe(true);

      // Performance Tab
      await page.click('button.performance'); // Click on the second tab (Performance)
      const expectedTextOnPerformanceTab = en["statistics.performanceOverTime"]; 
      const found2 = await page.evaluate((expectedTextOnPerformanceTab) => {
        return document.body.innerText.includes(expectedTextOnPerformanceTab);
      }, expectedTextOnPerformanceTab);
      expect(found2).toBe(true);

      // Game Modes Tab
      await page.click('button.gameModes'); // Click on the third tab (Game Modes)
      const expectedTextOnGameModeTab = en["statistics.gameModeComparison"]; 
      const found3 = await page.evaluate((expectedTextOnGameModeTab) => {
        return document.body.innerText.includes(expectedTextOnGameModeTab);
      }, expectedTextOnGameModeTab);
      expect(found3).toBe(true);
    });

    then('The user logs out successfully', async () => {
      await logout(page);
    });
  });
});
