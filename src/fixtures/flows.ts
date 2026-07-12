import type { PageFactory } from './page-factory';
import type { UserDetails } from '../types';
import { log } from '../utilities/log';

// Shared user flows built on the page objects, used by both steps and hooks
// so no UI journey is written twice.

// Registers a fresh account end-to-end and leaves the user logged in.
export async function registerUser(pages: PageFactory, user: UserDetails): Promise<void> {
  log.info(`Registering account ${user.email} (${user.name})`);
  await pages.signupLogin.open();
  await pages.signupLogin.expectLoaded();
  await pages.signupLogin.startSignup(user.name, user.email);
  await pages.accountInformation.completeRegistration(user);
  await pages.accountStatus.expectAccountCreated();
  await pages.accountStatus.continueToSite();
  await pages.header.expectLoggedInAs(user.name);
  log.debug(`Account ${user.email} registered and logged in`);
}

// Adds each product from the catalogue, returns name -> displayed unit price.
export async function addProductsToCart(
  pages: PageFactory,
  productNames: string[],
): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  await pages.products.open();
  await pages.products.expectLoaded();
  for (const name of productNames) {
    const price = await pages.products.addToCart(name);
    prices.set(name, price);
    log.debug(`Added "${name}" to cart (unit price ${price})`);
  }
  return prices;
}

// Deletes the user's account, logging in first if needed. Called from
// scenario cleanup; throws on unexpected failures so the caller decides
// how to report them.
export async function deleteAccount(pages: PageFactory, user: UserDetails): Promise<boolean> {
  if (!(await pages.header.isLoggedIn())) {
    await pages.signupLogin.open();
    await pages.signupLogin.login(user.email, user.password);
    if (await pages.signupLogin.isLoginRejected()) {
      // login rejected, so the account never made it, nothing to delete
      log.debug(`No account to delete for ${user.email} (login rejected)`);
      return false;
    }
  }
  await pages.header.deleteAccount();
  await pages.accountStatus.expectAccountDeleted();
  await pages.accountStatus.continueToSite();
  log.info(`Deleted account ${user.email}`);
  return true;
}
