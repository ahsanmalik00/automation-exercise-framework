import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';
import type { UserDetails } from '../types';

// "Enter Account Information" form shown after the first signup step
export class AccountInformationPage extends BasePage {
  private readonly heading: Locator;
  private readonly password: Locator;
  private readonly dayOfBirth: Locator;
  private readonly monthOfBirth: Locator;
  private readonly yearOfBirth: Locator;
  private readonly newsletterCheckbox: Locator;
  private readonly specialOffersCheckbox: Locator;
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly company: Locator;
  private readonly address: Locator;
  private readonly address2: Locator;
  private readonly country: Locator;
  private readonly state: Locator;
  private readonly city: Locator;
  private readonly zipcode: Locator;
  private readonly mobileNumber: Locator;
  private readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Enter Account Information' });
    this.password = page.getByTestId('password');
    this.dayOfBirth = page.getByTestId('days');
    this.monthOfBirth = page.getByTestId('months');
    this.yearOfBirth = page.getByTestId('years');
    this.newsletterCheckbox = page.getByRole('checkbox', {
      name: 'Sign up for our newsletter!',
    });
    this.specialOffersCheckbox = page.getByRole('checkbox', {
      name: 'Receive special offers from our partners!',
    });
    this.firstName = page.getByTestId('first_name');
    this.lastName = page.getByTestId('last_name');
    this.company = page.getByTestId('company');
    this.address = page.getByTestId('address');
    this.address2 = page.getByTestId('address2');
    this.country = page.getByTestId('country');
    this.state = page.getByTestId('state');
    this.city = page.getByTestId('city');
    this.zipcode = page.getByTestId('zipcode');
    this.mobileNumber = page.getByTestId('mobile_number');
    this.createAccountButton = page.getByTestId('create-account');
  }

  private titleRadio(title: UserDetails['title']): Locator {
    return this.page.getByRole('radio', { name: title, exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async expectPrefilledNameAndEmail(name: string, email: string): Promise<void> {
    await expect(this.page.getByTestId('name')).toHaveValue(name);
    await expect(this.page.getByTestId('email')).toHaveValue(email);
  }

  async fillAccountInformation(user: UserDetails): Promise<void> {
    await this.titleRadio(user.title).check();
    await this.password.fill(user.password);
    await this.dayOfBirth.selectOption(user.dateOfBirth.day);
    await this.monthOfBirth.selectOption({ label: user.dateOfBirth.month });
    await this.yearOfBirth.selectOption(user.dateOfBirth.year);
    if (user.newsletter) await this.newsletterCheckbox.check();
    if (user.specialOffers) await this.specialOffersCheckbox.check();
  }

  async fillAddressInformation(user: UserDetails): Promise<void> {
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.company.fill(user.company);
    await this.address.fill(user.address);
    await this.address2.fill(user.address2);
    await this.country.selectOption({ label: user.country });
    await this.state.fill(user.state);
    await this.city.fill(user.city);
    await this.zipcode.fill(user.zipcode);
    await this.mobileNumber.fill(user.mobileNumber);
  }

  async submit(): Promise<void> {
    await this.createAccountButton.click();
  }

  // fills the whole form and submits it
  async completeRegistration(user: UserDetails): Promise<void> {
    await this.expectLoaded();
    await this.fillAccountInformation(user);
    await this.fillAddressInformation(user);
    await this.submit();
  }
}
