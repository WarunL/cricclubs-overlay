const puppeteer = require("puppeteer");
const fs = require("fs");

// 🔄 Replace with your actual live match URL
const MATCH_URL = 'https://cricclubs.com/vlccl/viewScorecard.do?matchId=7174&clubId=146';

async function runScraper() {
  const browser = await puppeteer.launch({
    headless: true,
    // Remove the line below if you're using Puppeteer with bundled Chromium
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage();
  await page.goto(MATCH_URL, { waitUntil: 'networkidle2', timeout: 0 });

  await page.waitForSelector('div.batsman-table', { timeout: 20000 });

  const result = await page.evaluate(() => {
    const teamNames = Array.from(document.querySelectorAll('.match-score .team-name')).map(el => el.textContent.trim());
    const teamScores = Array.from(document.querySelectorAll('.match-score .team-score')).map(el => el.textContent.trim());

    const batterRows = Array.from(document.querySelectorAll('#strickerData tr'));
    let batter1 = '', batter2 = '';
    if (batterRows.length > 1) {
      const b1 = batterRows[0].querySelectorAll('td');
      const b2 = batterRows[1].querySelectorAll('td');
      batter1 = `🔵 ${b1[0]?.innerText} – ${b1[2]?.innerText} (${b1[3]?.innerText})`;
      batter2 = `🔵 ${b2[0]?.innerText} – ${b2[2]?.innerText} (${b2[3]?.innerText})`;
    }

    return {
      team1: `🔥 ${teamNames[0]}: ${teamScores[0]}`,
      team2: `💥 ${teamNames[1]}: ${teamScores[1]}`,
      batter1,
      batter2
    };
  });

  const html = `
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: transparent;
        font-family: sans-serif;
        color: white;
        text-shadow: 1px 1px 3px black;
      }
      .top, .bottom {
        position: absolute;
        width: 100%;
        text-align: center;
        font-size: 1.2em;
      }
      .top { top: 10px; }
      .bottom { bottom: 10px; }
    </style>
  </head>
  <body>
    <div class="top">
      ${result.batter1}<br>
      ${result.batter2}
    </div>
    <div class="bottom">
      ${result.team1}<br>
      ${result.team2}
    </div>
  </body>
  </html>
  `;

  fs.writeFileSync("overlay.html", html);
  console.log("✅ overlay.html updated with live score");

  await browser.close();
}

runScraper().catch(err => {
  console.error("❌ Error:", err);
});