// Helper functions for the E2E tests to avoid code repetition

async function register(page, user) {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" }).catch(() => {});
    await expect(page).toClick('a[name="signup"]');
    await page.waitForSelector('input[name="username"]'); // Wait for redirection
    await expect(page).toFill('input[name="username"]', user.username);
    await expect(page).toFill('input[name="password"]', user.password);
    await expect(page).toFill('input[name="repeatPassword"]', user.password);
    await expect(page).toClick('button[name="addUserButton"]');
    await page.waitForSelector('button[name="loginButton"]');
}

async function login(page, user) {
    await expect(page).toClick('a[name="login"]');
    await page.waitForSelector('input[name="username"]');
    await expect(page).toFill('input[name="username"]', user.username);
    await expect(page).toFill('input[name="password"]', user.password);
    await expect(page).toClick('button[name="loginButton"]');
    await page.waitForSelector('h1[id="home-title"]');
}

async function selectGameMode(page, mode) {
    await expect(page).toClick(`a[id="${mode}Button"]`);
    await page.waitForSelector('h2[id="gameQuestion"]', { visible: true, timeout: 5000 });
}

async function playBasicGame(page, questions) {
    await expect(page).toClick('button[id="gameAnswer0"]');
        for(let i = 0 ; i < 9 ; i++) {
            const imageCurrent = await page.$eval('img[alt="question hint image"]', (img) => img.src);
            await page.waitForFunction(
                (imageCurrent) => {
                    const image = document.querySelector('img[alt="question hint image"]');
                    if (image){
                        return image.src !== imageCurrent;
                    }
                    return false;  // Check if the image source changes
                },
                { timeout: 5000 }, imageCurrent
            );
            await expect(page).toClick('button[id="gameAnswer0"]');
        }
    await page.waitForSelector('h2[id="results-title"]');
}

async function seeGameStats(page) {
    await expect(page).toMatchElement('td[id="score-gameStat"]');
    await expect(page).toMatchElement('td[id="gameMode-gameStat"]');
    await expect(page).toMatchElement('td[id="questionsPassed-gameStat"]');
    await expect(page).toMatchElement('td[id="questionsFailed-gameStat"]');
    await expect(page).toMatchElement('td[id="accuracy-gameStat"]');
}

async function openLeaderboard(page) {
    await expect(page).toClick('a[href="/leaderboard"]');
    await page.waitForSelector('div.leaderboard-section', {
        visible: true,
        timeout: 5000
    });
}

async function logout(page) {
    await expect(page).toClick('button[id="logoutButton"]');
    await page.waitForSelector('h2[id="index-title"]');
}

module.exports = {
    register,
    login,
    selectGameMode,
    playBasicGame,
    seeGameStats,
    openLeaderboard,
    logout
};