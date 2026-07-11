import { expect as baseExpect } from '@playwright/test';

/**
 * Project-wide expect instance: web-first assertions retry until this timeout,
 * which suits the occasionally slow public demo site.
 */
export const expect = baseExpect.configure({ timeout: 15_000 });
