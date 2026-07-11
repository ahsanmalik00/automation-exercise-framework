'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ARTIFACT_DIRS = ['reports', 'test-results', 'screenshots'];

/** Empties (and re-creates) the artifact directories before a test run. */
function cleanArtifacts() {
  for (const dir of ARTIFACT_DIRS) {
    const absolute = path.resolve(__dirname, '..', dir);
    fs.rmSync(absolute, { recursive: true, force: true });
    fs.mkdirSync(absolute, { recursive: true });
    fs.writeFileSync(path.join(absolute, '.gitkeep'), '');
  }
}

module.exports = { cleanArtifacts };

if (require.main === module) {
  cleanArtifacts();
}
