/**
 * Cucumber.js profiles.
 * TypeScript support is provided through ts-node (transpile-only for speed;
 * full type safety is enforced separately via `npm run typecheck`).
 */
process.env.TS_NODE_TRANSPILE_ONLY = process.env.TS_NODE_TRANSPILE_ONLY ?? 'true';

const parallel = Number(process.env.PARALLEL ?? 1);

const common = {
  requireModule: ['ts-node/register'],
  require: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
  paths: ['features/**/*.feature'],
  format: [
    'progress-bar',
    'summary',
    'json:reports/cucumber-report.json',
    'html:reports/cucumber-report.html',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  parallel,
  strict: true,
};

module.exports = {
  default: common,
  // CI profile: plain progress output and a single retry for flaky-network resilience.
  ci: {
    ...common,
    format: common.format.filter((f) => f !== 'progress-bar').concat('progress'),
    retry: 1,
  },
};
