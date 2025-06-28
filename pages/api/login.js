// pages/api/login.js
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import axios from 'axios';

export default async function handler(req, res) {
  const {
    LOGIN_USERNAME,
    LOGIN_PASSWORD,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID
  } = process.env;

  const LOGIN_URL       = 'https://www.himalayanuniversity.com/student/student_login.php';
  const EXPECTED_URL    = 'https://www.himalayanuniversity.com/student/index.php';

  let browser = null;

  try {
    // launch headless Chromium
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();

    // go to login page
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

    // fill form
    await page.type('#frm_registration_no', LOGIN_USERNAME);
    await page.type('#frm_dob', LOGIN_PASSWORD);
    await page.click('#div_load');

    // wait for navigation or timeout
    try {
      await page.waitForURL(EXPECTED_URL, { timeout: 10_000 });
      await notifyTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, '✅ Login Success', `Logged in at ${new Date().toISOString()}`);
      res.status(200).json({ status: 'success', message: 'Login successful' });
    } catch {
      await notifyTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, '⚠️ Login Failure', 'Did not reach expected URL in time.');
      res.status(500).json({ status: 'failure', message: 'Login failed' });
    }
  } catch (e) {
    await notifyTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, '⚠️ Login Error', e.message);
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    if (browser) await browser.close();
  }
}

async function notifyTelegram(token, chatId, title, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await axios.post(url, {
    chat_id: chatId,
    text: `*${title}*\n${text}`,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  });
}
