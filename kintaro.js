const puppeteer = require('puppeteer');
const program = require("commander")
require('date-utils');


(async () => {
  program.parse(process.argv)
  // 認証情報
  const data = {
    id: program.args[0],
    password: program.args[1],
    start: "1000",
    end: program.args[2],
    rest: "0100"
  }
  const options = {
    headless: false, // ヘッドレスをオフに
    slowMo: 100  // 動作を遅く
  };
  const url = 'https://kintarou.r.recruit.co.jp/Lysithea/JSP_Files/authentication/WC010_1.jsp?dsname=lib.IASSTORE&PERSON_CODE=01039888&FROM=WC010_2'
  
  const browser = await puppeteer.launch(options)
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "domcontentloaded" })

  // ユーザーID入力
  await page.type('input[name="PersonCode"]', data.id)
  // パスワード入力
  await page.type('input[name="Password"]', data.password)
  await page.click('input[type="submit"]')

  await Promise.all([
    page.waitForNavigation()
  ])
  
  // なぜか前月のカレンダーが表示されていることがあるので処理を追加
  const homeButton = await page.$x('/html/body/div/div[1]/form[2]/header/nav/div[2]/a')
  await homeButton[0].click()

  await page.waitForSelector('.date')
  const d = await new Date()
  const currentMonth = await d.toFormat("M")
  const displayMonth = await page.$eval('.date > span:nth-child(3)', el => {
    return el.textContent
  })
  if (currentMonth !== displayMonth) {
    await page.click('a[class="nav-next"]')
  }

  // 休日判定
  // await page.waitForSelector('.today')
  // const holiday = await page.$eval('.today', el => {
  //   return el.classList.contains('offday')
  // })
  // if (holiday) {
  //   await browser.close()
  //   return 
  // }

  // 一週間まとめて入力したい
  // const weekdays = ["日", "月", "火", "水", "木", "金", "土"] // いらない
  await page.waitForSelector('.calendar-body', '.calendar-row', '.cell')
  const weeksNumber = await Math.floor((d.getDate() - d.getDay() + 12 ) / 7)
  const calendarRows = await page.$$('.calendar-body > .calendar-row')
  const calendarCells = await calendarRows[weeksNumber - 1].$$('.cell')


  for await (let calendarCell of calendarCells) {
    console.log("発火スタート")
    await calendarCell.click()
    console.log("発火スタートここは？")

    await Promise.all([
      page.waitForNavigation()
    ])
    console.log("発火スタートここはどお？")

    await page.click('#bar3_1000')
    await page.waitForSelector('#startTimeD')
    await page.$eval("#startTimeD", element => element.value = '')
    await page.$eval("#endTimeD", element => element.value = '')
    await page.type("#startTimeD", data.start)
    await page.type("#endTimeD", data.end)
    await page.type("#restTimeD", data.rest)
    await page.click("#importBtn")
    const registrationButton = await page.$x('/html/body/div/div[2]/div/form[3]/header/nav[2]/div/div/div[2]/div/button[2]')
    await Promise.all([
      page.waitForNavigation({waitUntil: ['load', 'networkidle2']}),
      registrationButton[0].click()
    ])
    
    // await page.$x('/html/body/div/div[2]/div/form[3]/header/nav[2]/div/div/div[2]/div/button[2]')
    // const buttonTagAll = await page.$$('button')
    // let tagText = []
    // let indicator = ""
    // for (let i = 0; i < buttonTagAll.length; i++) {
    //   tagText.push(await (await buttonTagAll[i].getProperty('textContent')).jsonValue())
    //   if(tagText[i].match(/登録/)){
    //     indicator = i
    //     break
    //   }
    // }
    // await buttonTagAll[indicator].click()
    console.log("発火2")
    await Promise.all([
      page.waitForNavigation({waitUntil: ['load', 'networkidle2']}),
      homeButton[0].click()
    ])
    console.log("発火3")


  }

  // // 今日の入力フォームを開く
  // await page.click('.today')
  // // モーダルを開く
  // await page.waitForSelector('#bar3_1000')
  // await page.click('#bar3_1000')
  // // モーダル内の処理
  // await page.waitForSelector('#startTimeD, #endTimeD')
  // await page.$eval("#startTimeD", element => element.value = '')
  // await page.$eval("#endTimeD", element => element.value = '')
  // await page.type("#startTimeD", data.start)
  // await page.type("#endTimeD", data.end)
  // await page.type("#restTimeD", data.rest)
  // await page.click("#importBtn")

  // // 登録ボタンを探して押す
  // const buttonTagAll = await page.$$('button')
  // let tagText = []
  // let indicator = ""
  // for (let i = 0; i < buttonTagAll.length; i++) {
  //   tagText.push(await (await buttonTagAll[i].getProperty('textContent')).jsonValue())
  //   if(tagText[i].match(/登録/)){
  //     indicator = i
  //     break
  //   }
  // }
  // await buttonTagAll[indicator].click()
  await browser.close()
})();