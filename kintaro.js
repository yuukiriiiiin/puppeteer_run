const puppeteer = require('puppeteer');

(async () => {
  const options = {
    headless: false, // ヘッドレスをオフに
    slowMo: 100  // 動作を遅く
  };
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto('https://kintarou.r.recruit.co.jp/Lysithea/JSP_Files/authentication/WC010_1.jsp?dsname=lib.IASSTORE&PERSON_CODE=01039888&FROM=WC010_2');
  // ユーザーID
  await page.type('input[name="PersonCode"]', process.argv[2]);
  // パスワード
  await page.type('input[name="Password"]', process.argv[3]);
  await page.click('input[type="submit"]');
  await Promise.all([
    page.waitForNavigation()
  ]);
  await page.click('a[class="nav-next"]')
  await page.waitForSelector('.today')
  await page.click('.today');
  await page.waitForSelector('#bar3_1000')
  await page.click('#bar3_1000')
  await page.waitForSelector('#startTimeD, #endTimeD')
  await page.$eval("#startTimeD", element => element.value = '')
  await page.$eval("#endTimeD", element => element.value = '')
  await page.type("#startTimeD", process.argv[4])
  await page.type("#endTimeD", process.argv[5])
  await page.click("#importBtn")
  const buttonTagAll = await page.$$('button');
  let tagText = [];
  let indicator = "";
  for (let i = 0; i < buttonTagAll.length; i++) {
    tagText.push(await (await buttonTagAll[i].getProperty('textContent')).jsonValue())
    if(tagText[i].match(/登録/)){
      indicator = i;
      break;
    }
  }
  await buttonTagAll[indicator].click();
  await browser.close();
})();