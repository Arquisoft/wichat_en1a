import { useTranslation } from "react-i18next";

const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const { register, login, selectGameMode, playBasicGame, seeGameStats, openStatistics, logout } = require('../helpers/helpers');
const feature = loadFeature('./features/check-stats.feature');
const { t } = useTranslation();

let browser, page;

let a; // Mock user object

defineFeature(feature, test => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 1 });
    page = await browser.newPage();
    a = { username: "UserA", password: 'PasswordA123!' };
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
      await openStatistics(page);
    });

    then('The user is shown an informative message', async () => {
      const expectedText = t("statistics.noData"); 
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
      await openStatistics(page);
    });

    then('The user can see the statistics', async () => {
      
    });

    then('The user can navigate through the three tabs of the statistics view', async () => {
      
    });

    then('The user logs out successfully', async () => {
      await logout(page);
    });
  });
});
