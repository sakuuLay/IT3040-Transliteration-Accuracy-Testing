# Transliteration Accuracy Testing

Run Singlish → Sinhala automated tests using Playwright.

Requirements

Install

```bash
npm install
npx playwright install
```

Run tests

```bash
npx playwright test
```

Results
# Transliteration Accuracy Testing

This repository contains 50 placeholder negative Singlish→Sinhala test cases and a Playwright test suite that inputs each case into the chat translator, captures the actual output, compares it with the expected output, and writes results into an Excel file plus screenshots.

Requirements
- Node.js 16+ (Node 18 recommended)

Quick start

1. Clone the repo and change into the folder.

```bash
git clone <repo-url>
cd IT3040-Transliteration-Accuracy-Testing
```

2. Install dependencies and Playwright browsers.

```bash
npm install
npx playwright install
```

3. Run the tests (headless by default).

```bash
npx playwright test
```

4. View results and artifacts

- Excel results: `results/neg_test_results.xlsx`
- Screenshots: `results/screenshots/`
- HTML test report: `npx playwright show-report`

Notes
- Test cases are defined in `data/neg_testcases_full.json`. Each entry includes `tcid`, `length`, `input`, `expected`, `actual` (placeholder), `type`, and `rationale`.
- The Playwright test will capture the live `actual` output and write it to the Excel file; the `actual` placeholders in the JSON are preserved there only as initial data.
- The test suite runs sequentially (`workers: 1`) to ensure Excel writes are deterministic.
