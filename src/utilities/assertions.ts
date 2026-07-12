import { expect as baseExpect } from '@playwright/test';

// Shared expect with a longer retry timeout, the public demo site can be slow.
export const expect = baseExpect.configure({ timeout: 15_000 });
