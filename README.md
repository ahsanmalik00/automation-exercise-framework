# Automation Exercise — UI Automation Framework

Production-quality UI test automation for [automationexercise.com](https://automationexercise.com), built with **TypeScript**, **Playwright**, **Cucumber.js (Gherkin BDD)** and the **Page Object Model**.

## Covered functionality

| Feature                                        | Scenarios                                                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Registration (`features/registration.feature`) | New account with unique email (Mr./Mrs. via Scenario Outline), duplicate-email rejection                       |
| Login (`features/login.feature`)               | Valid credentials, invalid credentials, invalid-login error message                                            |
| Cart (`features/cart.feature`)                 | Two different products (names, unit prices, quantities, line totals), quantity increment on re-add             |
| Checkout (`features/checkout.feature`)         | Successful order with generated dummy payment data, mandatory payment-field validation, guest checkout blocked |

Every account created by a test is deleted in scenario cleanup; cleanup problems are attached to the report as warnings and never mask the original test result.

## Technology stack

- Node.js ≥ 20, TypeScript (strict)
- Playwright `1.61.1`
- Cucumber.js 13 with a custom World (context + page per scenario)
- `@faker-js/faker` data factories, `dotenv` configuration
- ESLint (type-checked rules) + Prettier
- Cucumber JSON/HTML reports + `multiple-cucumber-html-reporter` dashboard

## Prerequisites

- Node.js 20+ and npm

## Installation

```bash
npm ci
npx playwright install chromium        # add firefox / webkit if you need them
```

## Environment setup

```bash
cp .env.example .env
```

| Variable                           | Default                          | Purpose                                                                                                                                                                   |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BASE_URL`                         | `https://automationexercise.com` | Application under test                                                                                                                                                    |
| `BROWSER`                          | `chromium`                       | `chromium` \| `firefox` \| `webkit`                                                                                                                                       |
| `HEADLESS`                         | `true`                           | Headed/headless execution                                                                                                                                                 |
| `PARALLEL`                         | `1`                              | Cucumber worker count (scenarios are isolated)                                                                                                                            |
| `TRACE`                            | `false`                          | Save a Playwright trace for failed scenarios                                                                                                                              |
| `LOG_LEVEL`                        | `info`                           | `silent` \| `error` \| `warn` \| `info` \| `debug` — `info` logs scenario lifecycle and key flows; `debug` adds per-step timing                                            |
| `VALID_USER_EMAIL/_PASSWORD/_NAME` | _(empty)_                        | Optional existing account for login scenarios. When empty, a disposable account is registered and deleted automatically, so **no secrets are required** to run the suite. |

Never commit `.env` — it is gitignored; `.env.example` contains no real secrets.

## Running the tests

```bash
npm test                      # full suite
npm run test:smoke            # @smoke only
npm run test:regression       # @regression only
npm run test:headed           # headed browser
npm run test:chromium         # explicit browser selection
npm run test:firefox
npm run test:webkit
npm run test:ci               # CI profile (plain progress output, 1 retry)

# any Cucumber CLI arg passes through:
npm test -- --tags "@cart and not @wip"
npm test -- features/login.feature
```

Quality gates:

```bash
npm run typecheck
npm run lint
npm run format          # or format:check
```

## Reports

Generated on every run — **including failed runs** (the runner wrapper always produces reports before propagating the exit code):

- `reports/cucumber-report.json` — machine-readable results
- `reports/cucumber-report.html` — Cucumber's built-in HTML report
- `reports/html/index.html` — rich dashboard (durations, tags, metadata, embedded failure screenshots) — rebuild anytime with `npm run report`
- `screenshots/` — full-page screenshots of failed scenarios
- `test-results/traces/` — Playwright traces for failures when `TRACE=true` (open with `npx playwright show-trace <file>.zip`)

## Logging

Console logging is leveled and controlled by `LOG_LEVEL` (see `src/utilities/logger.ts`):

- `info` (default) — scenario start/end with status and duration, browser launch config, account registration/deletion
- `debug` — everything above plus each Gherkin step with its duration, cart additions with captured prices, page JS errors, and failed network requests
- `warn` / `error` — failures only (failed steps log at `error` with the failing URL, screenshot and trace paths); cleanup problems log at `warn`
- `silent` — no console logging (reports are still generated)

Logs are written to **stderr** with timestamps and worker ids, so they never corrupt the progress bar and interleave safely in parallel runs. Colors are disabled automatically when output is piped (or with `NO_COLOR=1`).

```bash
LOG_LEVEL=debug npm test -- --tags "@smoke"   # per-step detail
LOG_LEVEL=silent npm test                     # reports only
```

## Folder structure

```
├── features/                    # Gherkin feature files (business language)
├── src/
│   ├── steps/                   # Step definitions — thin, call page/flow methods only
│   ├── support/                 # Custom World, hooks, browser lifecycle
│   ├── pages/                   # Page objects (all locators live here)
│   ├── components/              # Reusable components (header, cart modal)
│   ├── fixtures/                # Page factory + composed business flows
│   ├── data/                    # Faker-based test-data factories
│   ├── utilities/               # env config, expect config, price parsing
│   └── types/                   # Shared interfaces
├── scripts/                     # Runner wrapper, artifact cleanup, reporting
├── reports/ screenshots/ test-results/   # Generated artifacts (gitignored)
├── cucumber.js                  # Cucumber profiles (default + ci)
└── .env.example                 # Configuration template (no secrets)
```

## Design notes & assumptions

- **Selectors**: the site exposes stable `data-qa` attributes; Playwright's `testIdAttribute` is set to `data-qa`, so `getByTestId()` is used alongside `getByRole`/`getByText`/`getByLabel`. No absolute XPath, no positional indexes; products are selected by catalogue name.
- **Isolation**: one browser per worker, one context + page per scenario; unique emails per execution (timestamp + pid + random), safe for parallel runs.
- **No fixed waits**: Playwright auto-waiting and web-first assertions only; ad/analytics hosts are blocked per context for speed and stability, and a locator handler dismisses the region-dependent consent dialog.
- **Cleanup**: accounts created by scenarios are deleted in the `After` hook _after_ failure evidence is captured; cleanup failures are attached as report warnings, never thrown.
- **Checkout validation**: the payment form relies on HTML constraint validation (`required`), so the mandatory-field scenario asserts the browser blocks submission, the constraint message is reported, and no order confirmation appears.
- The header "New User Signup!" / add-to-cart anchors have quirks (icon glyphs in accessible names, `<a>` without `href`), documented inline where non-role locators were required.

## Known limitations

- The public demo site is shared: it can be slow, rate-limit, or show regional consent dialogs/ads. Ad-blocking, generous assertion timeouts, and a single CI retry mitigate this.
- `ENVIRONMENT` has a single mapping (production) since only one public deployment exists.
- Order history cannot be asserted beyond the confirmation page — the demo site does not persist a verifiable order view.

## Possible improvements

- Visual regression snapshots for key pages; accessibility (axe) checks.
- Faster login-state setup via storageState reuse for non-login scenarios.
- Sharded CI execution (`--shard`) across build agents; Allure reporting.
- Contract tests for the site's public API (explicitly out of scope here).

## Troubleshooting

| Symptom                                        | Fix                                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `browserType.launch: Executable doesn't exist` | `npx playwright install <browser>`                                                                 |
| Timeouts on every scenario                     | Check connectivity to `BASE_URL`; the demo site occasionally throttles — retry or lower `PARALLEL` |
| Login scenarios fail with env credentials      | Verify `VALID_USER_*` values; unset them to fall back to disposable accounts                       |
| Empty `reports/html`                           | Run `npm run report` (requires `reports/cucumber-report.json`)                                     |
