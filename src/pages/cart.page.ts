import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';
import { parsePrice } from '../utilities/price';
import type { CartLine } from '../types';

// Cart page 
export class CartPage extends BasePage {
  private readonly cartTable: Locator;
  private readonly rows: Locator;
  private readonly proceedToCheckoutButton: Locator;
  private readonly checkoutModal: Locator;

  constructor(page: Page) {
    super(page);
    this.cartTable = page.locator('#cart_info');
    this.rows = page.locator('#cart_info tbody tr');
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');
    this.checkoutModal = page.locator('#checkoutModal');
  }

  private rowFor(productName: string): Locator {
    return this.rows.filter({
      has: this.page.getByRole('link', { name: productName, exact: true }),
    });
  }

  async open(): Promise<void> {
    await this.goto('/view_cart');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.cartTable).toBeVisible();
  }

  async productNames(): Promise<string[]> {
    return this.rows.locator('.cart_description h4 a').allInnerTexts();
  }

  // reads price, quantity and line total for one product row
  async cartLine(productName: string): Promise<CartLine> {
    const row = this.rowFor(productName);
    await expect(row).toBeVisible();
    return {
      name: productName,
      unitPrice: parsePrice(await row.locator('.cart_price p').innerText()),
      quantity: Number(await row.locator('.cart_quantity button').innerText()),
      lineTotal: parsePrice(await row.locator('.cart_total .cart_total_price').innerText()),
    };
  }

  // cart must hold exactly these products, order doesn't matter
  async expectExactlyProducts(productNames: string[]): Promise<void> {
    await expect(this.rows).toHaveCount(productNames.length);
    for (const name of productNames) {
      await expect(this.rowFor(name)).toBeVisible();
    }
  }

  // checks one row against the expected price and quantity
  async expectCartLine(productName: string, unitPrice: number, quantity: number): Promise<void> {
    const line = await this.cartLine(productName);
    expect(line.unitPrice, `${productName} unit price`).toBe(unitPrice);
    expect(line.quantity, `${productName} quantity`).toBe(quantity);
    expect(line.lineTotal, `${productName} line total`).toBe(unitPrice * quantity);
  }

  // the button shows before the site wires up its click handler, so an early
  // click does nothing; keep clicking until the checkout page opens
  async proceedToCheckout(): Promise<void> {
    await expect(async () => {
      await this.proceedToCheckoutButton.click();
      await expect(this.page).toHaveURL(/\/checkout/, { timeout: 2_000 });
    }).toPass();
  }

  // same race as above, but for guests a register/login modal opens instead
  async proceedToCheckoutAsGuest(): Promise<void> {
    await expect(async () => {
      await this.proceedToCheckoutButton.click();
      await expect(this.checkoutModal).toBeVisible({ timeout: 2_000 });
    }).toPass();
  }

  // guests get asked to register or log in before checkout
  async expectRegisterOrLoginPrompt(): Promise<void> {
    await expect(this.checkoutModal).toBeVisible();
    await expect(this.checkoutModal.getByRole('link', { name: 'Register / Login' })).toBeVisible();
  }
}
