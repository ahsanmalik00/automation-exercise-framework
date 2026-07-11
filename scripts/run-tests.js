'use strict';

/**
 * Test runner wrapper: cleans previous artifacts, runs Cucumber with any
 * pass-through CLI arguments, and always generates the HTML report —
 * even when scenarios fail — before exiting with Cucumber's exit code.
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { cleanArtifacts } = require('./clean-artifacts');
const { generateReport } = require('./generate-report');

cleanArtifacts();

const cucumberBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'cucumber-js.cmd' : 'cucumber-js',
);

const result = spawnSync(cucumberBin, process.argv.slice(2), {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

void generateReport().finally(() => {
  process.exit(result.status ?? 1);
});
