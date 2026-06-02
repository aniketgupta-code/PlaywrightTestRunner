# Overtur E2E Test Automation

Playwright-based end-to-end test automation framework for the Overtur application.

---

## Tech Stack

- [Playwright](https://playwright.dev/) — browser automation
- [TypeScript](https://www.typescriptlang.org/) — language
- [otplib](https://github.com/yeojz/otplib) — TOTP/MFA support
- [dotenv](https://github.com/motdotla/dotenv) — environment config
- [moment](https://momentjs.com/) — date formatting

---

## Project Structure

```
src/
  pages/              # Page Object Model classes (locators + actions)
    commonPage.ts
    dashboardPage.ts
    platformPage.ts
    index.ts
  specs/              # Test files grouped by module
    dashboard/
    platform/
  data/
    testData.json     # Hardcoded test data keyed by test case title
  utils/
    common.ts         # Shared helpers, env config, OTP generation
    credentials.ts    # Credential fetching from environment variables
    index.ts
configs/              # Environment config files (gitignored)
  .env                # Base environment variables
  local.env           # Local credential overrides — never commit
uploads/              # Files used for upload tests
downloads/            # Files downloaded during tests (gitignored)
reports/              # Test output (gitignored)
global-setup.ts       # Cleans output directories before each run
global-teardown.ts
playwright.config.ts
azure-pipeline.yml
```

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v22.x
- npm

### 1. Install dependencies

```bash
npm ci
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

To install a specific browser only:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install msedge
```

### 3. Configure environment

Create `configs/local.env` (gitignored — never commit real credentials):

```ini
# User credentials — format: <USER_TYPE>_EMAIL / _PASSWORD / _NAME / _SECRET
EXTERNAL_USER_EMAIL=your@email.com
EXTERNAL_USER_PASSWORD=yourpassword
EXTERNAL_USER_NAME=Your Name
EXTERNAL_USER_SECRET=YOUR_BASE32_TOTP_SECRET
```

The base `configs/.env` is also gitignored. Copy from a team member or password manager.

---

## Running Tests

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm test`              | Run all tests headless                      |
| `npm run test:headless` | Force all tests to run in headless mode     |
| `npm run report`        | Open the last HTML report                   |
| `npm run typecheck`     | TypeScript type check without running tests |

### Filter by tag

```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

You can also use the `TAGS` env var, which supports comma-separated lists and exclusions:

```bash
# Run tests matching any of the listed tags
cross-env TAGS=@smoke npm test
cross-env TAGS=@smoke,@regression npm test

# Exclude a tag with !
cross-env TAGS=!@slow npm test

# Pre-built shortcut
npm run test:smoke
```

`@` is optional — `TAGS=smoke` and `TAGS=@smoke` are equivalent. Exclusions take precedence over inclusions when combined.

### Filter by browser

```bash
npx playwright test --project=chrome
npx playwright test --project=firefox
npx playwright test --project=edge
```

### Filter by module/spec

```bash
npx playwright test src/specs/dashboard
```

---

## Writing Tests

### Test data

Add test case data to `src/data/testData.json` keyed by the test case title:

```json
{
  "TC_38546_CreateProject": {
    "projectName": ""
  }
}
```

Access it in the test:

```ts
const testData = currentTestData();
```

### Credentials

Fetch credentials by user type (matches prefix in `local.env`):

```ts
const creds = await fetchCredentials("external_user");
```

### Tags

Tag tests for filtering:

```ts
test("TC_38546_CreateProject", { tag: ["@dashboard", "@regression"] }, async ({ page }) => {
```

Available tags: `@smoke`, `@regression`, `@PRODSmoke`, `@E2E`, `@identity`, `@dashboard`, etc.

---

## CI / Azure DevOps

The pipeline (`azure-pipeline.yml`) supports the following parameters:

| Parameter     | Options                                    | Default    |
| ------------- | ------------------------------------------ | ---------- |
| `Environment` | `DEV`, `QA`, `UAT`, `PROD`                 | `QA`       |
| `Browser`     | `chromium`, `firefox`, `webkit`            | `chromium` |
| `Module`      | `ALL`, `dashboard`, `platform`, ...        | `ALL`      |
| `TestTag`     | `@smoke`, `@regression`, `@PRODSmoke`, ... | `@smoke`   |
| `retryCount`  | number                                     | `0`        |

Credentials are injected from Azure Key Vault pipeline variables — no secrets are stored in the repo.

> **Note:** Only `@PRODSmoke` tagged tests are permitted to run against the PROD environment.

---

## BrowserStack

Tests can be run on BrowserStack's cloud device grid. Browser/OS combinations are configured in `browserstack.yml`.

### Prerequisites

Add your BrowserStack credentials to `configs/.env`:

```ini
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
```

### Running on BrowserStack

```bash
npm run test:browserstack           # all tests
npm run test:browserstack:smoke     # @smoke tests only
```

### Local execution

`run-browserstack.js` loads `configs/.env`, sets the required SDK env vars, and wraps the BrowserStack SDK command. It accepts any additional Playwright arguments:

```bash
node run-browserstack.js
node run-browserstack.js --grep @smoke
node run-browserstack.js src/specs/dashboard

# Or via npm
npm run local:test:browserstack
```

---

## Debugging

Open Playwright Inspector:

```bash
npx playwright test --debug
```

View a trace file:

```bash
npm run showtrace
```

Record a new script:

```bash
npm run record-script
```

Traces and screenshots are captured automatically on test failure and saved to `reports/`.
