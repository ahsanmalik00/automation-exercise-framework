import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';

// Order confirmation page after a successful payment isdone
export class OrderConfirmationPage extends BasePage {
  private readonly orderPlacedHeading: Locator;
  private readonly confirmationMessage: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.orderPlacedHeading = page.getByTestId('order-placed');
    this.confirmationMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.continueButton = page.getByTestId('continue-button');
  }

  async expectOrderPlaced(): Promise<void> {
    await expect(this.orderPlacedHeading).toBeVisible();
    await expect(this.orderPlacedHeading).toHaveText(/order placed!/i);
    await expect(this.confirmationMessage).toBeVisible();
  }

  async continueShopping(): Promise<void> {
    await this.continueButton.click();
  }
}
