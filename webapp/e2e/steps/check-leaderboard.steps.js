const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const { register, login, selectGameMode, playBasicGame, seeGameStats, openLeaderboard, logout } = require('../helpers/helpers');
const feature = loadFeature('./features/check-leaderboard.feature');

let browser, page;

let a, b; // Mock user objects

defineFeature(feature, test => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 1 });
    page = await browser.newPage();
    a = { username: "UserA", password: 'PasswordA123!' };
    b = { username: "UserB", password: 'PasswordB123!' };
    setDefaultOptions({ timeout: 10000 })
    await register(page, a); // Register user A
    await register(page, b); // Register user B

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  afterAll(async () => {
    await browser.close();
  });

  test('The user checks the leaderboard results after a game is played', ({ given, when, then }) => {

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

    when('The user clicks the leaderboard in the navigation bar', async () => {
      await openLeaderboard(page);
    });

    then('The user sees the results, including the recently played game', async () => {
      const found = await page.evaluate((username) => {
        const listItems = Array.from(document.querySelectorAll('li'));
        return listItems.some(li => li.textContent.includes(username));
      }, a.username);
          
      expect(found).toBe(true);
    });

    then('The user logs out successfully', async () => {
      await logout(page);
    });
  });

  test('A user checks the leaderboard results after another user has played', ({ given, when, then }) => {

    given('Two registered users A and B', async () => {
      await login(page, a);
      await logout(page);
      await login(page, b);
      await logout(page);
    });

    when('User A logs in correctly', async () => {
      await login(page, a);
    });

    when('User A selects the basic game mode', async () => {
        await selectGameMode(page, "basicQuiz");
    });
  
    when('User A plays the game', async () => {
        await playBasicGame(page, 10);
    });

    then('User A sees the statistics of the game', async () => {
      await seeGameStats(page);
    });

    then('User A logs out successfully', async () => {
      await logout(page);
    });

    when('User B logs in correctly', async () => {
      await login(page, b);
    });

    then('User B clicks the leaderboard in the navigation bar', async () => {
      await openLeaderboard(page);
    });

    then("User B sees the stored results, including user A's game", async () => {
      const found = await page.evaluate((username) => {
        const listItems = Array.from(document.querySelectorAll('li'));
        return listItems.some(li => li.textContent.includes(username));
      }, a.username);
              
      expect(found).toBe(true);
    });

    then('User B logs out successfully', async () => {
      await logout(page);
    });
  });

  test('A user checks an empty leaderboard', ({ given, when, then }) => {
    
    given('A registered user that exists in the database', async () => {
      await login(page, a);
      await logout(page);
    });

    when('The user logs in correctly', async () => {
      await login(page, a);
    });

    when('The user clicks the leaderboard in the navigation bar', async () => {
      await openLeaderboard(page);
    });

    then('The user sees an empty leaderboard', async () => {
      const rows = await page.$$('tr');
      expect(rows.length).toBe(0);
    });

    then('The user logs out successfully', async () => {
      await logout(page);
    });
  });
});
