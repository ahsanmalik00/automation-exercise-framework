import type { Page } from '@playwright/test';

/**
 * Common base for all page objects. Navigation is always relative to the
 * browser context's baseURL, so no environment URL leaks into page classes.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}
