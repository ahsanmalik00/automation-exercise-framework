import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CartModalComponent } from '../components/cart-modal.component';
import { expect } from '../utilities/assertions';
import { parsePrice } from '../utilities/price';

/** Product catalogue (/products). Products are addressed by name, never by index. */
export class ProductsPage extends BasePage {
  private readonly heading: Locator;
  private readonly cartModal: CartModalComponent;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'All Products' });
    this.cartModal = new CartModalComponent(page);
  }

  private productCard(productName: string): Locator {
    return this.page
      .locator('.features_items .product-image-wrapper')
      .filter({ has: this.page.locator('.productinfo').getByText(productName, { exact: true }) });
  }

  async open(): Promise<void> {
    await this.goto('/products');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  /** Reads the unit price displayed on the product card. */
  async displayedPrice(productName: string): Promise<number> {
    const priceLabel = await this.productCard(productName).locator('.productinfo h2').innerText();
    return parsePrice(priceLabel);
  }

  /**
   * Adds a product to the cart from its catalogue card and dismisses the
   * confirmation modal. Returns the unit price shown for the product.
   */
  async addToCart(productName: string): Promise<number> {
    const card = this.productCard(productName);
    await card.scrollIntoViewIfNeeded();
    const price = await this.displayedPrice(productName);
    // The add-to-cart anchor has no href, hence no `link` role — match by text.
    await card.locator('.productinfo').getByText('Add to cart').click();
    await this.cartModal.expectProductAdded();
    await this.cartModal.continueShopping();
    return price;
  }
}
