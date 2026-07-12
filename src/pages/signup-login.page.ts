import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '../utilities/assertions';

// Combined signup / login page. Test ids map to the site's
// data-qa attributes.
export class SignupLoginPage extends BasePage {
  private readonly signupHeading: Locator;
  private readonly loginHeading: Locator;
  private readonly signupName: Locator;
  private readonly signupEmail: Locator;
  private readonly signupButton: Locator;
  private readonly loginEmail: Locator;
  private readonly loginPassword: Locator;
  private readonly loginButton: Locator;
  private readonly loginError: Locator;
  private readonly signupEmailExistsError: Locator;

  constructor(page: Page) {
    super(page);
    this.signupHeading = page.getByRole('heading', { name: 'New User Signup!' });
    this.loginHeading = page.getByRole('heading', { name: 'Login to your account' });
    this.signupName = page.getByTestId('signup-name');
    this.signupEmail = page.getByTestId('signup-email');
    this.signupButton = page.getByTestId('signup-button');
    this.loginEmail = page.getByTestId('login-email');
    this.loginPassword = page.getByTestId('login-password');
    this.loginButton = page.getByTestId('login-button');
    this.loginError = page.getByText('Your email or password is incorrect!');
    this.signupEmailExistsError = page.getByText('Email Address already exist!');
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.loginHeading).toBeVisible();
    await expect(this.signupHeading).toBeVisible();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async expectInvalidLoginError(): Promise<void> {
    await expect(this.loginError).toBeVisible();
  }

  async expectSignupRejectedForExistingEmail(): Promise<void> {
    await expect(this.signupEmailExistsError).toBeVisible();
  }

  async expectStillOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
  }

  async isLoginRejected(): Promise<boolean> {
    return this.loginError.isVisible();
  }
}
