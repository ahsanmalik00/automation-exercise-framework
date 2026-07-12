import type { Locator, Page } from '@playwright/test';
import { expect } from '../utilities/assertions';

// Top navigation header, present on every page
export class HeaderComponent {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('#header');
  }

  private navLink(name: string): Locator {
    // link names start with an icon glyph, so match by substring;
    // scoping to #header keeps that safe
    return this.root.getByRole('link', { name });
  }

  private get loggedInLabel(): Locator {
    return this.root.getByText('Logged in as');
  }

  async goToSignupLogin(): Promise<void> {
    await this.navLink('Signup / Login').click();
  }

  async goToProducts(): Promise<void> {
    await this.navLink('Products').click();
  }

  async goToCart(): Promise<void> {
    await this.navLink('Cart').click();
  }

  async logout(): Promise<void> {
    await this.navLink('Logout').click();
  }

  async deleteAccount(): Promise<void> {
    await this.navLink('Delete Account').click();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.loggedInLabel.isVisible();
  }

  async expectLoggedInAs(username: string): Promise<void> {
    await expect(this.loggedInLabel).toBeVisible();
    await expect(this.loggedInLabel).toContainText(username);
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.loggedInLabel).toBeHidden();
    await expect(this.navLink('Signup / Login')).toBeVisible();
  }
}
