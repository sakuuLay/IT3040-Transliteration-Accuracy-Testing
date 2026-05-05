const { test, expect } = require('@playwright/test');
const ExcelJS = require('exceljs');
const fs = require('fs');

const cases = require('../data/neg_testcases_full.json');

test.describe('Singlish → Sinhala negative test cases', () => {
  test('run all negative cases and log to Excel', async ({ page }) => {
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

    for (const tc of cases) {
      await page.goto('https://www.pixelssuite.com/chat-translator', { waitUntil: 'networkidle' });
      const inputSelector = 'textarea';
      await page.fill(inputSelector, tc.input);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      const outputSelector = '.translation-result, .translated-text, .result';
      let actual = '';
      try {
        actual = await page.textContent(outputSelector);
      } catch (e) {
        // fallback: try reading last message
        const messages = await page.$$('div.message');
        if (messages.length) actual = await messages[messages.length - 1].textContent();
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

      // save a screenshot evidence per case
      const screenshotDir = 'results/screenshots';
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: `${screenshotDir}/${tc.tcid}.png`, fullPage: true });
    }

    if (!fs.existsSync('results')) fs.mkdirSync('results');
    await workbook.xlsx.writeFile('results/neg_test_results.xlsx');
  });
});
