import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';
import type { PaymentDetails } from '../types';

/** Payment page (/payment). Only dummy generated card data is ever used here. */
export class PaymentPage extends BasePage {
  private readonly nameOnCard: Locator;
  private readonly cardNumber: Locator;
  private readonly cvc: Locator;
  private readonly expiryMonth: Locator;
  private readonly expiryYear: Locator;
  private readonly payButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCard = page.getByTestId('name-on-card');
    this.cardNumber = page.getByTestId('card-number');
    this.cvc = page.getByTestId('cvc');
    this.expiryMonth = page.getByTestId('expiry-month');
    this.expiryYear = page.getByTestId('expiry-year');
    this.payButton = page.getByTestId('pay-button');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment$/);
    await expect(this.nameOnCard).toBeVisible();
  }

  async payWith(details: PaymentDetails): Promise<void> {
    await this.nameOnCard.fill(details.nameOnCard);
    await this.cardNumber.fill(details.cardNumber);
    await this.cvc.fill(details.cvc);
    await this.expiryMonth.fill(details.expiryMonth);
    await this.expiryYear.fill(details.expiryYear);
    await this.payButton.click();
  }

  async submitWithoutDetails(): Promise<void> {
    await this.payButton.click();
  }

  async expectOrderNotPlaced(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment$/);
    await expect(this.page.getByTestId('order-placed')).toBeHidden();
  }

  /**
   * With empty mandatory fields the browser blocks submission, so the user
   * must remain on the payment page and the first mandatory field reports
   * a constraint-validation message.
   */
  async expectMandatoryFieldsReported(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment$/);
    const validationMessage = await this.nameOnCard.evaluate(
      (input: HTMLInputElement) => input.validationMessage,
    );
    expect(validationMessage, 'validation message of first mandatory field').not.toBe('');
  }
}
