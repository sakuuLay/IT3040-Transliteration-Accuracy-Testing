const { test, expect } = require('@playwright/test');
const ExcelJS = require('exceljs');
const fs = require('fs');

const cases = require('../data/neg_testcases_full.json');

const RESULTS_DIR = 'results';
const SCREENSHOT_DIR = `${RESULTS_DIR}/screenshots`;

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Results');
sheet.columns = [
  { header: 'TC ID', key: 'tcid', width: 15 },
  { header: 'Input length type (S/M/L)', key: 'length', width: 10 },
  { header: 'Input', key: 'input', width: 40 },
  { header: 'Expected output', key: 'expected', width: 40 },
  { header: 'Actual output', key: 'actual', width: 40 },
  { header: 'Status (Pass/Fail)', key: 'status', width: 10 },
  { header: 'Input type covered', key: 'type', width: 20 },
  { header: 'Evidence/rationale', key: 'rationale', width: 40 }
];

test.describe('Singlish → Sinhala negative test cases', () => {
  test.setTimeout(10 * 60 * 1000);

  for (const tc of cases) {
    test(tc.tcid, async ({ page }) => {
      let actual = '';
      try {
        await page.goto('https://www.pixelssuite.com/chat-translator', { waitUntil: 'domcontentloaded' });

        // try a set of possible input selectors
        const inputSelectors = ['textarea', 'input[type="text"]', 'input', 'div[contenteditable="true"]'];
        let inputHandle = null;
        let foundSelector = null;
        for (const sel of inputSelectors) {
          inputHandle = await page.$(sel);
          if (inputHandle) {
            foundSelector = sel;
            break;
          }
        }

        if (inputHandle && foundSelector) {
          try {
            await inputHandle.fill(tc.input);
          } catch (e) {
            await page.evaluate((s, v) => {
              const el = document.querySelector(s);
              if (el) {
                el.focus();
                el.value = v;
                el.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }, foundSelector, tc.input);
          }
        } else {
          // fallback: set into body
          await page.evaluate((v) => { document.body.innerText = v; }, tc.input);
        }

        // attempt to submit: try Enter, then click common buttons
        try { await page.keyboard.press('Enter'); } catch (e) {}
        const buttonSelectors = ['button:has-text("Translate")', 'button:has-text("Send")', 'button[type=submit]'];
        for (const b of buttonSelectors) {
          const btn = await page.$(b);
          if (btn) { try { await btn.click(); } catch (e) {} }
        }

        // wait briefly for response
        await page.waitForTimeout(2000);

        // try common output selectors, else grab body text
        const outputSelectors = ['.translation-result', '.translated-text', '.result', '.output', '.reply'];
        for (const sel of outputSelectors) {
          const el = await page.$(sel);
          if (el) {
            actual = (await el.textContent()) || '';
            break;
          }
        }

        if (!actual) {
          try { actual = (await page.textContent('body')) || ''; } catch (e) { actual = ''; }
        }

      } catch (err) {
        actual = `ERROR: ${err.message}`;
      }

      const status = actual && actual.trim() === tc.expected.trim() ? 'Pass' : 'Fail';

      sheet.addRow({
        tcid: tc.tcid,
        length: tc.length,
        input: tc.input,
        expected: tc.expected,
        actual: actual || 'NO_OUTPUT',
        status,
        type: tc.type,
        rationale: tc.rationale || ''
      });

      // screenshot
      try { await page.screenshot({ path: `${SCREENSHOT_DIR}/${tc.tcid}.png`, fullPage: true }); } catch (e) {}
    });
  }

  test.afterAll(async () => {
    if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR);
    await workbook.xlsx.writeFile(`${RESULTS_DIR}/neg_test_results.xlsx`);
  });
});
