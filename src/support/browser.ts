import { chromium, firefox, webkit } from '@playwright/test';
import type { Browser, LaunchOptions } from '@playwright/test';
import { env } from '../utilities/env';
import { log } from '../utilities/log';

/**
 * One browser per Cucumber worker process. Contexts and pages are created
 * per scenario in the hooks — this is the only place a browser is launched.
 */
let browser: Browser | undefined;

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    log.debug(`Worker launching ${env.browser} (headless=${env.headless})`);
    const options: LaunchOptions = { headless: env.headless };
    switch (env.browser) {
      case 'firefox':
        browser = await firefox.launch(options);
        break;
      case 'webkit':
        browser = await webkit.launch(options);
        break;
      case 'chromium':
        browser = await chromium.launch(options);
        break;
    }
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  await browser?.close();
  browser = undefined;
}

/** Third-party ad/analytics hosts aborted per context: faster, ad-free, stable. */
export const BLOCKED_HOSTS =
  /googlesyndication|googleads|doubleclick|adservice|google-analytics|googletagmanager|googletagservices|amazon-adsystem|fundingchoicesmessages/;
