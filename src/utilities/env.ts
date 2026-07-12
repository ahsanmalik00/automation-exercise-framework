import * as dotenv from 'dotenv';
import { parseLogLevel } from './logger';
import type { LogLevel } from './logger';

dotenv.config({ quiet: true });

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

export interface EnvConfig {
  baseUrl: string;
  browser: BrowserName;
  headless: boolean;
  trace: boolean;
  isCi: boolean;
  actionTimeoutMs: number;
  navigationTimeoutMs: number;
  stepTimeoutMs: number;
  logLevel: LogLevel;
  validUser?: { email: string; password: string; name: string };
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

function parseBrowser(value: string | undefined): BrowserName {
  const browser = (value ?? 'chromium').toLowerCase();
  if (browser === 'chromium' || browser === 'firefox' || browser === 'webkit') {
    return browser;
  }
  throw new Error(`Unsupported BROWSER "${value}". Use chromium, firefox or webkit.`);
}

function parseValidUser(): EnvConfig['validUser'] {
  const email = process.env.VALID_USER_EMAIL;
  const password = process.env.VALID_USER_PASSWORD;
  if (!email || !password) return undefined;
  return { email, password, name: process.env.VALID_USER_NAME ?? email.split('@')[0] };
}

const isCi = parseBoolean(process.env.CI, false);

export const env: EnvConfig = {
  baseUrl: process.env.BASE_URL ?? 'https://automationexercise.com',
  browser: parseBrowser(process.env.BROWSER),
  // CI runners have no display, so a headed launch would crash there — force
  // headless on CI no matter what HEADLESS says.
  headless: isCi || parseBoolean(process.env.HEADLESS, true),
  trace: parseBoolean(process.env.TRACE, false),
  isCi,
  actionTimeoutMs: 15_000,
  navigationTimeoutMs: 45_000,
  stepTimeoutMs: 120_000,
  logLevel: parseLogLevel(process.env.LOG_LEVEL),
  validUser: parseValidUser(),
};
