import { When, Then } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { expect } from '../utilities/assertions';

When(
  'the user adds the following products to the cart:',
  async function (this: CustomWorld, table: DataTable) {
    for (const row of table.hashes()) {
      const price = await this.pages.products.addToCart(row.product);
      this.addedProductPrices.set(row.product, price);
    }
  },
);

When(
  'the user adds the product {string} to the cart',
  async function (this: CustomWorld, productName: string) {
    const price = await this.pages.products.addToCart(productName);
    this.addedProductPrices.set(productName, price);
  },
);

When(
  'the user adds the product {string} to the cart twice',
  async function (this: CustomWorld, productName: string) {
    let price = 0;
    for (let i = 0; i < 2; i += 1) {
      price = await this.pages.products.addToCart(productName);
    }
    this.addedProductPrices.set(productName, price);
  },
);

Then('the cart should contain exactly those products', async function (this: CustomWorld) {
  await this.pages.header.goToCart();
  await this.pages.cart.expectLoaded();
  await this.pages.cart.expectExactlyProducts([...this.addedProductPrices.keys()]);
});

Then(
  'each cart line should show the catalogue unit price, a quantity of 1 and a matching line total',
  async function (this: CustomWorld) {
    for (const [name, unitPrice] of this.addedProductPrices) {
      await this.pages.cart.expectCartLine(name, unitPrice, 1);
    }
  },
);

Then(
  'the cart line for {string} should show a quantity of 2',
  async function (this: CustomWorld, productName: string) {
    await this.pages.header.goToCart();
    await this.pages.cart.expectLoaded();
    const line = await this.pages.cart.cartLine(productName);
    expect(line.quantity, `${productName} quantity`).toBe(2);
  },
);

Then(
  'the line total for {string} should equal twice its unit price',
  async function (this: CustomWorld, productName: string) {
    const line = await this.pages.cart.cartLine(productName);
    const catalogueUnitPrice = this.addedProductPrices.get(productName);
    expect(line.unitPrice, `${productName} unit price`).toBe(catalogueUnitPrice);
    expect(line.lineTotal, `${productName} line total`).toBe(line.unitPrice * 2);
  },
);
