import type { Page } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SignupLoginPage } from '../pages/signup-login.page';
import { AccountInformationPage } from '../pages/account-information.page';
import { AccountStatusPage } from '../pages/account-status.page';
import { ProductsPage } from '../pages/products.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { PaymentPage } from '../pages/payment.page';
import { OrderConfirmationPage } from '../pages/order-confirmation.page';
import { HeaderComponent } from '../components/header.component';

/**
 * Lazily instantiates page objects for the scenario's page.
 * Step definitions access every page/component through this single factory.
 */
export class PageFactory {
  private readonly cache = new Map<string, unknown>();

  constructor(private readonly page: Page) {}

  private get<T>(key: string, create: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, create());
    }
    return this.cache.get(key) as T;
  }

  get home(): HomePage {
    return this.get('home', () => new HomePage(this.page));
  }

  get signupLogin(): SignupLoginPage {
    return this.get('signupLogin', () => new SignupLoginPage(this.page));
  }

  get accountInformation(): AccountInformationPage {
    return this.get('accountInformation', () => new AccountInformationPage(this.page));
  }

  get accountStatus(): AccountStatusPage {
    return this.get('accountStatus', () => new AccountStatusPage(this.page));
  }

  get products(): ProductsPage {
    return this.get('products', () => new ProductsPage(this.page));
  }

  get cart(): CartPage {
    return this.get('cart', () => new CartPage(this.page));
  }

  get checkout(): CheckoutPage {
    return this.get('checkout', () => new CheckoutPage(this.page));
  }

  get payment(): PaymentPage {
    return this.get('payment', () => new PaymentPage(this.page));
  }

  get orderConfirmation(): OrderConfirmationPage {
    return this.get('orderConfirmation', () => new OrderConfirmationPage(this.page));
  }

  get header(): HeaderComponent {
    return this.get('header', () => new HeaderComponent(this.page));
  }
}
