# Automation Exercise — Test Automation Framework

End-to-end test automation for [automationexercise.com](https://automationexercise.com), covering both deliverables of the case study:

1. **Part 1 — UI Automation**: TypeScript + Playwright + Cucumber.js (Gherkin BDD) + Page Object Model
2. **Part 2 — JMeter API Testing**: a parameterised `.jmx` test plan covering the Signup API, Login API, the Add-to-Cart flow captured from browser DevTools, and the bonus website checkout flow

---

## Quick start

```bash
# 1. Install dependencies
npm ci
npx playwright install chromium

# 2. Configure the environment
cp .env.example .env        # defaults work out of the box — no secrets needed

# 3. Run the UI suite
npm test

# 4. Open the HTML dashboard
open reports/html/index.html

# 5. (Part 2) Run the JMeter API plan — requires JMeter 5.x
cd jmeter && jmeter -n -t AutomationExercise_API_TestPlan.jmx -l results/results.jtl -e -o results/html
```

A passing UI run ends with `11 scenarios (11 passed)` / `71 steps (71 passed)` and exit code 0.

---

## Part 1 — UI Automation

### Covered functionality

| Feature                                        | Scenarios                                                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Registration (`features/registration.feature`) | New account with unique email (Mr./Mrs. via Scenario Outline), duplicate-email rejection                       |
| Login (`features/login.feature`)               | Valid credentials, invalid credentials, invalid-login error message                                            |
| Cart (`features/cart.feature`)                 | Two different products (names, unit prices, quantities, line totals), quantity increment on re-add             |
| Checkout (`features/checkout.feature`)         | Successful order with generated dummy payment data, mandatory payment-field validation, guest checkout blocked |

Every account created by a test is deleted in scenario cleanup; cleanup problems are attached to the report as warnings and never mask the original test result.

### What has been integrated, and why

| Integration                                 | Why it is here                                                                                                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Playwright** `1.61.1`                     | The preferred tool in the brief. Auto-waiting, web-first assertions, multi-browser (Chromium/Firefox/WebKit), traces and screenshots built in.                 |
| **Cucumber.js 13** + Gherkin                | BDD requirement. Feature files read as business language; a custom World gives every scenario its own isolated browser context and page.                       |
| **Page Object Model**                       | All locators live in `src/pages` and `src/components`; steps stay thin and readable, and a UI change is fixed in exactly one place.                            |
| **TypeScript (strict)**                     | See ["Why TypeScript"](#why-typescript) below.                                                                                                                 |
| **@faker-js/faker**                         | Generates realistic, unique test data (users, addresses, payment details) per run — no hardcoded fixtures, safe for parallel execution.                        |
| **dotenv**                                  | Environment-driven configuration (`.env`), keeping secrets and machine-specific settings out of the codebase.                                                  |
| **Custom leveled logger**                   | Scenario/step lifecycle logging with durations, worker ids and colored statuses, controlled by `LOG_LEVEL`. Writes to stderr so formatter output stays intact. |
| **multiple-cucumber-html-reporter**         | Rich HTML dashboard on top of Cucumber's JSON output — durations, tags, run metadata, embedded failure screenshots.                                            |
| **ESLint (type-checked rules) + Prettier**  | Enforced code quality and consistent formatting (`npm run lint`, `npm run format`).                                                                            |
| **Runner wrapper** (`scripts/run-tests.js`) | Cleans old artifacts, runs Cucumber, and **always** generates reports — even for failed runs — before propagating the real exit code.                          |
| **Ad/analytics request blocking**           | Third-party ad hosts are aborted per context: faster, more stable, and no consent/ad popups breaking runs.                                                     |
| **Automatic account cleanup**               | Accounts created by scenarios are deleted in the `After` hook, keeping the shared demo site clean.                                                             |

### Why TypeScript

The brief allowed JavaScript or TypeScript; TypeScript was chosen deliberately:

- **Compile-time safety for test code.** A broken page-object method name, a renamed step argument, or a wrong parameter type fails `npm run typecheck` in seconds — instead of failing at runtime 40 seconds into a browser session.
- **Refactoring confidence.** With `strict` mode, moving files or changing an interface (e.g. `UserDetails`) surfaces every affected call site immediately. The framework was restructured mid-project and the compiler caught every stale import.
- **Self-documenting contracts.** Shared types (`src/types`) define exactly what a user, cart line, or payment detail looks like; page objects and data factories cannot drift apart silently.
- **First-class tooling.** Playwright and Cucumber both ship TypeScript definitions, so locators, hooks, and World members are fully autocompleted and type-checked in the IDE.
- **No build-step overhead.** Tests execute through `ts-node` in transpile-only mode, so there is no compile step to run or output folder to manage — full type safety is enforced separately via `npm run typecheck`.

### Prerequisites

- Node.js 20+ and npm
- (Part 2 only) Java 8+ and [Apache JMeter](https://jmeter.apache.org/) 5.x (`brew install jmeter` on macOS)

### Installation

```bash
npm ci
npx playwright install chromium        # add firefox / webkit if you need them
```

### Environment setup

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
| `LOG_LEVEL`                        | `info`                           | `silent` \| `error` \| `warn` \| `info` \| `debug` — `info` logs scenario lifecycle and key flows; `debug` adds per-step timing                                           |
| `VALID_USER_EMAIL/_PASSWORD/_NAME` | _(empty)_                        | Optional existing account for login scenarios. When empty, a disposable account is registered and deleted automatically, so **no secrets are required** to run the suite. |

Never commit `.env` — it is gitignored; `.env.example` contains no real secrets.

> **Gotcha:** any `.env` value containing `#` or spaces must be wrapped in quotes (`VALID_USER_PASSWORD="p#ss w0rd"`), otherwise dotenv truncates it at the `#` as an inline comment.

### Running the tests

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
npm test -- --tags "@smoke and not @cart"
npm test -- features/login.feature
npm test -- --name "Login with valid credentials"
```

Available tags: `@smoke`, `@regression`, and per-feature `@registration`, `@login`, `@cart`, `@checkout`.

Quality gates:

```bash
npm run typecheck
npm run lint
npm run format          # or format:check
```

### Reports

Generated on every run — **including failed runs** (the runner wrapper always produces reports before propagating the exit code):

- `reports/cucumber-report.json` — machine-readable results
- `reports/cucumber-report.html` — Cucumber's built-in HTML report
- `reports/html/index.html` — rich dashboard (durations, tags, metadata, embedded failure screenshots) — rebuild anytime with `npm run report`
- `screenshots/` — full-page screenshots of failed scenarios
- `test-results/traces/` — Playwright traces for failures when `TRACE=true` (open with `npx playwright show-trace <file>.zip`)

Report metadata (executed-by, device, browser, base URL, build number) is configured in `scripts/generate-report.js`.

### Logging

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

---

## Part 2 — JMeter API Testing

### Test plan

`jmeter/AutomationExercise_API_TestPlan.jmx` contains four thread groups:

| Thread group                       | What it does                                                                                                                                                                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TG01 — Signup API**              | `POST /api/createAccount` with a unique email per iteration (JSR223-generated). Asserts HTTP 200, body `responseCode: 201` and `"User created!"`, and response time under 8s.                                                                 |
| **TG02 — Login API**               | Creates a user, then `POST /api/verifyLogin` with valid credentials (asserts `"User exists!"`) and with unregistered credentials as a negative test.                                                                                          |
| **TG03 — Add to Cart flow**        | Captured from browser DevTools and recreated: establish session on `GET /`, `GET /add_to_cart/1` (Blue Top), `GET /add_to_cart/2` (Men Tshirt), verify both products on `GET /view_cart`. Uses an HTTP Cookie Manager for session continuity. |
| **TG04 — Bonus: website checkout** | Full browser-captured checkout journey with CSRF token extraction: login page → signup → add to cart → checkout → `POST /payment` (place order).                                                                                              |

Each thread group runs a small pool of virtual users with think time (200–500ms), and every sampler carries status-code and/or response-body assertions, per the case-study requirements.

The plan is parameterised — host and protocol can be overridden without editing the JMX:

```bash
jmeter -n -t AutomationExercise_API_TestPlan.jmx -Jhost=automationexercise.com -Jprotocol=https ...
```

### Running the JMeter tests

```bash
cd jmeter
rm -rf results/html                    # -e -o requires a non-existent/empty output folder
jmeter -n -t AutomationExercise_API_TestPlan.jmx \
  -l results/results.jtl \
  -j results/jmeter.log \
  -e -o results/html
```

- `-n` — non-GUI mode (always use this for actual runs; the GUI is for editing the plan)
- `-l results/results.jtl` — raw results log (**the exported `.jtl`**)
- `-e -o results/html` — generates the **HTML dashboard** at `jmeter/results/html/index.html`

To view or edit the plan interactively, open it in the JMeter GUI: `jmeter -t AutomationExercise_API_TestPlan.jmx`.

### JMeter results

Last executed run (all thread groups, shared public site): **34 samples, 0 errors (0.00%)**, avg response 518ms, p90 1.25s, max 1.6s.

- `jmeter/results/results.jtl` — exported raw results
- `jmeter/results/html/index.html` — HTML dashboard (APDEX, response-time percentiles, throughput, errors)

---

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
│   ├── utilities/               # env config, logger, expect config, price parsing
│   └── types/                   # Shared interfaces
├── jmeter/
│   ├── AutomationExercise_API_TestPlan.jmx   # JMeter test plan (Part 2)
│   └── results/                 # Exported .jtl + HTML dashboard
├── scripts/                     # Runner wrapper, artifact cleanup, reporting
├── reports/ screenshots/ test-results/   # Generated UI artifacts (gitignored)
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
- **JMeter flows** (TG03/TG04) were captured from browser DevTools network traffic and recreated with a cookie manager and CSRF-token extractors, as required by the brief.

## Known limitations

- The public demo site is shared: it can be slow, rate-limit, or show regional consent dialogs/ads. Ad-blocking, generous assertion timeouts, and a single CI retry mitigate this.
- Order history cannot be asserted beyond the confirmation page — the demo site does not persist a verifiable order view.
- JMeter runs create accounts on the shared site via the signup API; the demo site offers a delete API, but load-run accounts are throwaway by design.

## Possible improvements

- Visual regression snapshots for key pages; accessibility (axe) checks.
- Faster login-state setup via storageState reuse for non-login scenarios.
- Sharded CI execution (`--shard`) across build agents; Allure reporting.
- GitHub Actions workflow running the suite + publishing reports on every push.
- JMeter: CSV-driven credential datasets, ramp-up profiles, and CI-integrated performance baselines.

## Troubleshooting

| Symptom                                        | Fix                                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `browserType.launch: Executable doesn't exist` | `npx playwright install <browser>`                                                                                                    |
| `ERR_NAME_NOT_RESOLVED` on every scenario      | Your machine/DNS cannot resolve `BASE_URL` — check `curl -I https://automationexercise.com`, switch DNS (e.g. 8.8.8.8) or retry later |
| Timeouts on every scenario                     | Check connectivity to `BASE_URL`; the demo site occasionally throttles — retry or lower `PARALLEL`                                    |
| Login scenarios fail with env credentials      | Verify `VALID_USER_*` values (quote values containing `#`); unset them to fall back to disposable accounts                            |
| Empty `reports/html`                           | Run `npm run report` (requires `reports/cucumber-report.json`)                                                                        |
| JMeter: `Cannot write to folder, not empty`    | Delete `jmeter/results/html` before re-running with `-e -o`                                                                           |
| VSCode shows undefined-step warnings           | Reload the window — `.vscode/settings.json` points the Cucumber extension at `src/steps`                                              |
