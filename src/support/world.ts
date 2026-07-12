import { World, setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { PageFactory } from '../fixtures/page-factory';
import { env } from '../utilities/env';
import type { UserDetails } from '../types';

setDefaultTimeout(env.stepTimeoutMs);

// Per-scenario world: one browser context and page, plus the state that
// steps and hooks share.
export class CustomWorld extends World {
  context!: BrowserContext;
  page!: Page;
  pages!: PageFactory;

  // user this scenario works with (registered or being registered)
  activeUser?: UserDetails;

  // accounts created here that cleanup must delete
  accountsToClean: UserDetails[] = [];

  // catalogue prices captured when products were added
  addedProductPrices = new Map<string, number>();

  // false when env credentials come without a display name
  verifyLoginName = true;

  // timing anchors for the duration logs in the hooks
  scenarioStartMs = 0;
  stepStartMs = 0;

  constructor(options: IWorldOptions) {
    super(options);
  }

  // remember this account so cleanup deletes it after the scenario
  trackAccountForCleanup(user: UserDetails): void {
    this.accountsToClean.push(user);
  }

  markAccountDeleted(user: UserDetails): void {
    this.accountsToClean = this.accountsToClean.filter((u) => u.email !== user.email);
  }
}

setWorldConstructor(CustomWorld);
