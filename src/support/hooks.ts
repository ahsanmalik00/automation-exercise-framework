import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  BeforeStep,
  Status,
} from '@cucumber/cucumber';
import type { ITestCaseHookParameter, ITestStepHookParameter } from '@cucumber/cucumber';
import { selectors } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getBrowser, closeBrowser, BLOCKED_HOSTS } from './browser';
import { CustomWorld } from './world';
import { PageFactory } from '../fixtures/page-factory';
import { deleteAccount } from '../fixtures/flows';
import { env } from '../utilities/env';
import { log } from '../utilities/log';
import { colorize } from '../utilities/logger';

const SCREENSHOTS_DIR = path.resolve('screenshots');
const TRACES_DIR = path.resolve('test-results', 'traces');

function artifactName(scenario: ITestCaseHookParameter): string {
  const scenarioSlug = scenario.pickle.name.replace(/\W+/g, '-').toLowerCase().slice(0, 60);
  return `${scenarioSlug}-${Date.now()}`;
}

/** Renders a scenario/step result with a colour that matches its status. */
function formatStatus(status: (typeof Status)[keyof typeof Status] | undefined): string {
  switch (status) {
    case Status.PASSED:
      return colorize('green', 'PASSED');
    case Status.FAILED:
      return colorize('red', 'FAILED');
    default:
      return colorize('yellow', String(status ?? 'UNKNOWN'));
  }
}

BeforeAll(async function () {
  // The site exposes stable `data-qa` hooks; use them via getByTestId().
  selectors.setTestIdAttribute('data-qa');
  log.info(
    `Launching ${env.browser} (headless=${env.headless}) against ${env.baseUrl} ` +
      `— trace=${env.trace}, log level=${env.logLevel}`,
  );
  await getBrowser();
});

Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  this.scenarioStartMs = Date.now();
  const tags = scenario.pickle.tags.map((tag) => tag.name).join(' ');
  log.info(`▶ Scenario: ${scenario.pickle.name}${tags ? ` ${colorize('dim', tags)}` : ''}`);

  const browser = await getBrowser();
  this.context = await browser.newContext({
    baseURL: env.baseUrl,
    viewport: { width: 1440, height: 900 },
  });
  await this.context.route(BLOCKED_HOSTS, (route) => route.abort());

  if (env.trace) {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(env.actionTimeoutMs);
  this.page.setDefaultNavigationTimeout(env.navigationTimeoutMs);

  // Surface page-side problems that would otherwise stay invisible.
  this.page.on('pageerror', (error) => log.debug(`Page JS error: ${error.message}`));
  this.page.on('requestfailed', (request) => {
    if (!BLOCKED_HOSTS.test(request.url())) {
      log.debug(`Request failed: ${request.method()} ${request.url()}`);
    }
  });

  // Dismiss the GDPR consent dialog whenever it appears (region-dependent).
  await this.page.addLocatorHandler(
    this.page.getByRole('button', { name: 'Consent' }),
    async (button) => {
      log.debug('Dismissing consent dialog');
      await button.click();
    },
  );

  this.pages = new PageFactory(this.page);
});

BeforeStep(function (this: CustomWorld, step: ITestStepHookParameter) {
  this.stepStartMs = Date.now();
  log.debug(`  → ${step.pickleStep.text}`);
});

AfterStep(function (this: CustomWorld, step: ITestStepHookParameter) {
  const duration = Date.now() - this.stepStartMs;
  const status = step.result.status;
  if (status === Status.FAILED) {
    log.error(`  ✗ ${step.pickleStep.text} (${duration}ms)`);
  } else {
    log.debug(`  ✓ ${step.pickleStep.text} (${duration}ms)`);
  }
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const failed = scenario.result?.status === Status.FAILED;
  const duration = Date.now() - this.scenarioStartMs;
  log.info(
    `■ Scenario: ${scenario.pickle.name} — ${formatStatus(scenario.result?.status)} (${duration}ms)`,
  );
  if (failed && scenario.result?.message) {
    log.error(scenario.result.message.split('\n')[0]);
  }

  // 1. Capture evidence first, before cleanup navigates away.
  if (failed && !this.page.isClosed()) {
    log.error(`Failed at URL: ${this.page.url()}`);
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${artifactName(scenario)}.png`);
      fs.writeFileSync(screenshotPath, screenshot);
      log.error(`Screenshot saved: ${screenshotPath}`);
      this.attach(screenshot, 'image/png');
      this.attach(`Failed at URL: ${this.page.url()}`, 'text/plain');
    } catch (error) {
      log.warn(`Screenshot capture failed: ${String(error)}`);
      this.attach(`Screenshot capture failed: ${String(error)}`, 'text/plain');
    }
  }

  // 2. Delete accounts created by the scenario. Cleanup problems are attached
  //    as warnings only — they must never mask the scenario's own result.
  for (const user of [...this.accountsToClean]) {
    try {
      if (!this.page.isClosed()) {
        await deleteAccount(this.pages, user);
        this.markAccountDeleted(user);
      }
    } catch (error) {
      const warning = `Cleanup warning: could not delete account ${user.email}: ${String(error)}`;
      log.warn(warning);
      this.attach(warning, 'text/plain');
    }
  }

  // 3. Persist the trace for failed scenarios, then always release resources.
  try {
    if (env.trace) {
      if (failed) {
        fs.mkdirSync(TRACES_DIR, { recursive: true });
        const tracePath = path.join(TRACES_DIR, `${artifactName(scenario)}.zip`);
        await this.context.tracing.stop({ path: tracePath });
        log.error(`Trace saved: ${tracePath} (open with: npx playwright show-trace)`);
        this.attach(`Trace saved: ${tracePath}`, 'text/plain');
      } else {
        await this.context.tracing.stop();
      }
    }
  } finally {
    await this.page.close();
    await this.context.close();
  }
});

AfterAll(async function () {
  await closeBrowser();
  log.debug('Browser closed — worker done.');
});
