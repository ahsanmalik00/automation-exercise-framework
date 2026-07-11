import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildPaymentDetails } from '../data/payment.factory';

When('the user proceeds to checkout', async function (this: CustomWorld) {
  await this.pages.header.goToCart();
  await this.pages.cart.expectLoaded();
  await this.pages.cart.proceedToCheckout();
  await this.pages.checkout.expectLoaded();
});

Then(
  'the delivery address should match the registered account details',
  async function (this: CustomWorld) {
    const user = this.activeUser;
    if (!user) throw new Error('No registered user available in this scenario.');
    await this.pages.checkout.expectDeliveryAddressMatches(user);
  },
);

Then(
  'the order review should list the cart products with the correct total amount',
  async function (this: CustomWorld) {
    const names = [...this.addedProductPrices.keys()];
    await this.pages.checkout.expectOrderReviewContains(names);
    const expectedTotal = [...this.addedProductPrices.values()].reduce((sum, p) => sum + p, 0);
    await this.pages.checkout.expectTotalAmount(expectedTotal);
  },
);

When(
  'the user confirms the order paying with valid card details',
  async function (this: CustomWorld) {
    await this.pages.checkout.placeOrder('Automated test order — please disregard.');
    await this.pages.payment.expectLoaded();
    await this.pages.payment.payWith(buildPaymentDetails(this.activeUser?.name));
  },
);

Then('the order should be placed successfully', async function (this: CustomWorld) {
  await this.pages.orderConfirmation.expectOrderPlaced();
});

When('the user proceeds to checkout and continues to payment', async function (this: CustomWorld) {
  await this.pages.header.goToCart();
  await this.pages.cart.expectLoaded();
  await this.pages.cart.proceedToCheckout();
  await this.pages.checkout.expectLoaded();
  await this.pages.checkout.placeOrder();
  await this.pages.payment.expectLoaded();
});

When(
  'the user tries to pay without providing any card details',
  async function (this: CustomWorld) {
    await this.pages.payment.submitWithoutDetails();
  },
);

Then('the order should not be placed', async function (this: CustomWorld) {
  await this.pages.payment.expectOrderNotPlaced();
});

Then(
  'the payment form should indicate the mandatory card fields',
  async function (this: CustomWorld) {
    await this.pages.payment.expectMandatoryFieldsReported();
  },
);

When('the user proceeds to checkout as a guest', async function (this: CustomWorld) {
  await this.pages.header.goToCart();
  await this.pages.cart.expectLoaded();
  await this.pages.cart.proceedToCheckoutAsGuest();
});

Then(
  'the user should be prompted to register or log in before completing checkout',
  async function (this: CustomWorld) {
    await this.pages.cart.expectRegisterOrLoginPrompt();
  },
);
