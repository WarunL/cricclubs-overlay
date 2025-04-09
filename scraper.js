const puppeteer = require('puppeteer');
const fs = require('fs');

const MATCH_URL = 'https://cricclubs.com/vlccl/ballbyball.do?matchId=7169&clubId=146';

async function runScraper() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  await page.goto(MATCH_URL, { waitUntil: 'networkidle2', timeout: 0 });

  await page.waitForSelector('.match-score', { timeout: 20000 });

  const result = await page.evaluate(() => {
    const teamScores = Array.from(document.querySelectorAll('.match-score .team-name')).map(el => el.textContent.trim());
    const scoreBlocks = Array.from(document.querySelectorAll('.match-score .team-score')).map(el => el.textContent.trim());

    const batterRows = Array.from(document.querySelectorAll('#strickerData tr'));
    let batter1 = '', batter2 = '';
    if (batterRows.length > 1) {
      const b1 = batterRows[0].querySelectorAll('td');
      const b2 = batterRows[1].querySelectorAll('td');
      batter1 = `${b1[0]?.innerText} - ${b1[2]?.innerText} (${b1[3]?.innerText})`;
      batter2 = `${b2[0]?.innerText} - ${b2[2]?.innerText} (${b2[3]?.innerText})`;
    }

    return {
      team1: `${teamScores[0]}: ${scoreBlocks[0]}`,
      team2: `${teamScores[1]}: ${scoreBlocks[1]}`,
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
        🧢 ${result.batter1}<br>
        🧢 ${result.batter2}
      </div>
      <div class="bottom">
        🏏 ${result.team1}<br>
        🔄 ${result.team2}
      </div>
    </body>
  </html>
  `;

  fs.writeFileSync('overlay.html', html, 'utf8');
  console.log('✅ Overlay updated successfully!');
  await browser.close();
}

runScraper().catch(err => console.error('❌ Error:', err));

