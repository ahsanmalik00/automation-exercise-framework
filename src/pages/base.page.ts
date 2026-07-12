import type { Page } from '@playwright/test';

// Base for all page objects. goto() is relative to the context baseURL,
// so page classes never hardcode environment URLs.
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}
