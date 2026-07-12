'use strict';

// Runner wrapper: cleans old artifacts, runs Cucumber with any pass-through
// CLI args, always builds the HTML report (even on failures), then exits
// with Cucumber's exit code.

require('dotenv').config({ quiet: true });

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { cleanArtifacts } = require('./clean-artifacts');
const { generateReport } = require('./generate-report');

cleanArtifacts();
const nodeModules = path.resolve(__dirname, '..', 'node_modules');
const runCli = (entry, args) =>
  spawnSync(process.execPath, [path.join(nodeModules, ...entry), ...args], { stdio: 'inherit' });

const requested = (process.env.BROWSER ?? 'chromium').toLowerCase();
const browser = ['chromium', 'firefox', 'webkit'].includes(requested) ? requested : 'chromium';
const install = runCli(['playwright', 'cli.js'], ['install', browser]);
if (install.status !== 0) {
  console.warn(`Warning: "playwright install ${browser}" failed — the browser launch may fail.`);
}

const result = runCli(['@cucumber', 'cucumber', 'bin', 'cucumber.js'], process.argv.slice(2));

void generateReport().finally(() => {
  process.exit(result.status ?? 1);
});
