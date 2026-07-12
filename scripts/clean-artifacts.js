'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ARTIFACT_DIRS = ['reports', 'test-results', 'screenshots'];

// Wipes and recreates the artifact folders before a run.
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
