import { Given } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildUser } from '../data/user.factory';
import { registerUser, addProductsToCart } from '../fixtures/flows';
import { env } from '../utilities/env';

Given('the user is on the home page', async function (this: CustomWorld) {
  await this.pages.home.open();
  await this.pages.home.expectLoaded();
});

Given('the user is on the login page', async function (this: CustomWorld) {
  await this.pages.signupLogin.open();
  await this.pages.signupLogin.expectLoaded();
});

Given('the user is viewing the product catalogue', async function (this: CustomWorld) {
  await this.pages.products.open();
  await this.pages.products.expectLoaded();
});

/**
 * Provides a registered account and leaves the user logged out.
 * Uses VALID_USER_EMAIL / VALID_USER_PASSWORD when configured; otherwise a
 * disposable account is registered on the fly and deleted during cleanup.
 */
Given('a registered user exists', async function (this: CustomWorld) {
  if (env.validUser) {
    this.activeUser = buildUser({
      email: env.validUser.email,
      password: env.validUser.password,
      name: env.validUser.name,
    });
    this.verifyLoginName = Boolean(process.env.VALID_USER_NAME);
    return;
  }
  const user = buildUser();
  this.trackAccountForCleanup(user);
  await registerUser(this.pages, user);
  await this.pages.header.logout();
  await this.pages.header.expectLoggedOut();
  this.activeUser = user;
  this.verifyLoginName = true;
});

Given('a newly registered user is logged in', async function (this: CustomWorld) {
  const user = buildUser();
  this.trackAccountForCleanup(user);
  await registerUser(this.pages, user);
  this.activeUser = user;
});

Given(
  "the user's cart contains the following products:",
  async function (this: CustomWorld, table: DataTable) {
    const names = table.hashes().map((row) => row.product);
    const prices = await addProductsToCart(this.pages, names);
    prices.forEach((price, name) => this.addedProductPrices.set(name, price));
  },
);
