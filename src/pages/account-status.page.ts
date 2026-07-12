import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';

// "Account created" / "Account deleted" confirmation pages
export class AccountStatusPage extends BasePage {
  private readonly accountCreatedHeading: Locator;
  private readonly accountDeletedHeading: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountCreatedHeading = page.getByTestId('account-created');
    this.accountDeletedHeading = page.getByTestId('account-deleted');
    this.continueButton = page.getByTestId('continue-button');
  }

  async expectAccountCreated(): Promise<void> {
    await expect(this.accountCreatedHeading).toBeVisible();
    await expect(this.accountCreatedHeading).toHaveText(/account created!/i);
  }

  async expectAccountDeleted(): Promise<void> {
    await expect(this.accountDeletedHeading).toBeVisible();
    await expect(this.accountDeletedHeading).toHaveText(/account deleted!/i);
  }

  async continueToSite(): Promise<void> {
    await this.continueButton.click();
  }
}
