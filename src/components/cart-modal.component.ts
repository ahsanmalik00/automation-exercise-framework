import type { Locator, Page } from '@playwright/test';
import { expect } from '../utilities/assertions';

// Modal that pops up after a product is added to the cart
export class CartModalComponent {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('#cartModal');
  }

  async expectProductAdded(): Promise<void> {
    await expect(this.root.getByText('Your product has been added to cart.')).toBeVisible();
  }

  async continueShopping(): Promise<void> {
    await this.root.getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(this.root).toBeHidden();
  }

  async viewCart(): Promise<void> {
    await this.root.getByRole('link', { name: 'View Cart' }).click();
  }
}
