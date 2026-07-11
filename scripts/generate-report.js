'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');
const JSON_REPORT = path.join(REPORTS_DIR, 'cucumber-report.json');

/**
 * Builds the rich HTML dashboard (multiple-cucumber-html-reporter) from the
 * Cucumber JSON output. Runs even after failed test runs; never throws so it
 * cannot mask the test exit code.
 */
async function generateReport() {
  if (!fs.existsSync(JSON_REPORT)) {
    console.warn(`No JSON report found at ${JSON_REPORT} — skipping HTML report generation.`);
    return;
  }

  try {
    // The reporter is ESM-only; load it via dynamic import from CommonJS.
    const { generate } = await import('multiple-cucumber-html-reporter');
    await generate({
      jsonDir: REPORTS_DIR,
      reportPath: path.join(REPORTS_DIR, 'html'),
      pageTitle: 'Automation Exercise – UI Test Report',
      reportName: 'Automation Exercise UI Automation',
      displayDuration: true,
      displayReportTime: true,
      metadata: {
        browser: { name: process.env.BROWSER || 'chromium' },
        username: 'Ahsan Malik',
        device: 'Ahsan Malik',
        platform: { name: os.platform(), version: os.release() },
      },
      customData: {
        title: 'Run info',
        data: [
          { label: 'Executed by', value: 'Ahsan Malik' },
          { label: 'Base URL', value: process.env.BASE_URL || 'https://automationexercise.com' },
          { label: 'Build', value: process.env.BUILD_NUMBER || 'local' },
          { label: 'Executed at', value: new Date().toISOString() },
          { label: 'Headless', value: process.env.HEADLESS || 'true' },
        ],
      },
    });
    console.log(`HTML report generated: ${path.join(REPORTS_DIR, 'html', 'index.html')}`);
  } catch (error) {
    console.warn(`HTML report generation failed: ${String(error)}`);
  }
}

module.exports = { generateReport };

if (require.main === module) {
  void generateReport();
}
