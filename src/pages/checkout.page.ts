import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';
import { parsePrice } from '../utilities/price';
import type { UserDetails } from '../types';

/** Checkout review page (/checkout): address details + order review. */
export class CheckoutPage extends BasePage {
  private readonly addressDetailsHeading: Locator;
  private readonly reviewOrderHeading: Locator;
  private readonly deliveryAddress: Locator;
  private readonly reviewRows: Locator;
  private readonly totalAmount: Locator;
  private readonly commentBox: Locator;
  private readonly placeOrderLink: Locator;

  constructor(page: Page) {
    super(page);
    this.addressDetailsHeading = page.getByRole('heading', { name: 'Address Details' });
    this.reviewOrderHeading = page.getByRole('heading', { name: 'Review Your Order' });
    this.deliveryAddress = page.locator('#address_delivery');
    this.reviewRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.totalAmount = page
      .locator('#cart_info tr')
      .filter({ hasText: 'Total Amount' })
      .locator('.cart_total_price');
    // Plain unlabeled textarea — CSS by name attribute is the practical option.
    this.commentBox = page.locator('textarea[name="message"]');
    this.placeOrderLink = page.getByRole('link', { name: 'Place Order' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.addressDetailsHeading).toBeVisible();
    await expect(this.reviewOrderHeading).toBeVisible();
  }

  /** The delivery address must reflect the details captured at registration. */
  async expectDeliveryAddressMatches(user: UserDetails): Promise<void> {
    await expect(this.deliveryAddress).toBeVisible();
    await expect(this.deliveryAddress).toContainText(`${user.firstName} ${user.lastName}`);
    await expect(this.deliveryAddress).toContainText(user.address);
    await expect(this.deliveryAddress).toContainText(user.city);
    await expect(this.deliveryAddress).toContainText(user.country);
    await expect(this.deliveryAddress).toContainText(user.mobileNumber);
  }

  async expectOrderReviewContains(productNames: string[]): Promise<void> {
    await expect(this.reviewRows).toHaveCount(productNames.length);
    for (const name of productNames) {
      await expect(
        this.reviewRows.filter({
          has: this.page.getByRole('link', { name, exact: true }),
        }),
      ).toBeVisible();
    }
  }

  async expectTotalAmount(expectedTotal: number): Promise<void> {
    await expect(this.totalAmount).toBeVisible();
    expect(parsePrice(await this.totalAmount.innerText()), 'order total').toBe(expectedTotal);
  }

  async placeOrder(comment?: string): Promise<void> {
    if (comment) {
      await this.commentBox.fill(comment);
    }
    await this.placeOrderLink.click();
  }
}
