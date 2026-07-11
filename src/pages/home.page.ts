import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';

export class HomePage extends BasePage {
  private readonly carousel: Locator;

  constructor(page: Page) {
    super(page);
    this.carousel = page.locator('#slider');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/automationexercise/);
    await expect(this.carousel).toBeVisible();
  }
}
