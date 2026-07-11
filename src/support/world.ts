import { World, setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { PageFactory } from '../fixtures/page-factory';
import { env } from '../utilities/env';
import type { UserDetails } from '../types';

setDefaultTimeout(env.stepTimeoutMs);

/**
 * Custom Cucumber World: one browser context and page per scenario,
 * plus the scenario-scoped state shared between steps and hooks.
 */
export class CustomWorld extends World {
  context!: BrowserContext;
  page!: Page;
  pages!: PageFactory;

  /** User relevant to the running scenario (registered or being registered). */
  activeUser?: UserDetails;

  /** Accounts created by this scenario that must be deleted during cleanup. */
  accountsToClean: UserDetails[] = [];

  /** Unit prices captured from the catalogue when products were added. */
  addedProductPrices = new Map<string, number>();

  /** False when env credentials are used without a known display name. */
  verifyLoginName = true;

  /** Timing anchors used by the hooks to log scenario/step durations. */
  scenarioStartMs = 0;
  stepStartMs = 0;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Registers an account for guaranteed cleanup after the scenario. */
  trackAccountForCleanup(user: UserDetails): void {
    this.accountsToClean.push(user);
  }

  markAccountDeleted(user: UserDetails): void {
    this.accountsToClean = this.accountsToClean.filter((u) => u.email !== user.email);
  }
}

setWorldConstructor(CustomWorld);
