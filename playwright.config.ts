import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: "./configs/.env" });
dotenv.config({ path: "./configs/local.env" });

const CI: boolean = JSON.parse(process.env.TF_BUILD ?? "false");
const headless: boolean = JSON.parse(process.env.HEADLESS ?? "false");
const retryCount: number = parseInt(process.env.RETRY_COUNT ?? "0", 10);
const workerCount: number = parseInt(process.env.WORKER_COUNT ?? "1", 10);
const viewportWidth: number = parseInt(
  process.env.VIEWPORT_WIDTH ?? "1920",
  10,
);
const viewportHeight: number = parseInt(
  process.env.VIEWPORT_HEIGHT ?? "1080",
  10,
);
const playwrightRecordVideo: boolean = JSON.parse(
  process.env.PLAYWRIGHT_RECORD_VIDEO ?? "false",
);

// Build grep/grepInvert from the tags env var.
// Supports formats carried over from the existing pipeline TestTag parameter:
//   @smoke                          → grep /@smoke/
//   @smoke,@regression              → grep /@smoke|@regression/
//   @PRODSmoke+OR+@identity         → grep /@PRODSmoke|@identity/
//   @regression+And+@!smoke         → grep /@regression/, grepInvert /@smoke/
function buildGrepConfig(tagsEnv: string | undefined): {
  grep?: RegExp;
  grepInvert?: RegExp;
} {
  if (!tagsEnv) return {};

  // Handle +AND+ with potential negation: "@regression+And+@!smoke"
  if (/\+and\+/i.test(tagsEnv)) {
    const parts = tagsEnv.split(/\+and\+/i).map((t) => t.trim());
    const required = parts
      .filter((p) => !p.startsWith("@!"))
      .map((p) => (p.startsWith("@") ? p : `@${p}`));
    const excluded = parts
      .filter((p) => p.startsWith("@!"))
      .map((p) => p.replace(/^@!/, "@"));
    return {
      grep: required.length ? new RegExp(required.join("|")) : undefined,
      grepInvert: excluded.length ? new RegExp(excluded.join("|")) : undefined,
    };
  }

  // Handle +OR+ and plain comma-separated: "@PRODSmoke+OR+@identity" or "@smoke,@regression"
  const tagList = tagsEnv
    .split(/\+or\+|,/i)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("@") ? t : `@${t}`));

  return { grep: new RegExp(tagList.join("|")) };
}

const { grep, grepInvert } = buildGrepConfig(process.env.TAGS);

export default defineConfig({
  testDir: "./src/specs",
  testMatch: "**/src/specs/**/*.spec.ts",
  fullyParallel: false,
  workers: workerCount,
  projects: browser(),
  retries: retryCount,
  timeout: 1_000_000,
  grep,
  grepInvert,
  forbidOnly: CI,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  reporter: [
    ["list"],
    ["junit", { outputFile: "./reports/junit-results.xml" }],
    ["html", { outputFolder: "./reports/html", open: "on-failure" }],
  ],
  outputDir: "./downloads",
  use: {
    headless: headless,
    screenshot: "only-on-failure",
    video: playwrightRecordVideo ? "retain-on-failure" : "off",
    trace: "retain-on-failure",
    viewport: {
      width: viewportWidth,
      height: viewportHeight,
    },
  },
});

export function browser() {
  const browserName = process.env.BROWSER ?? "chrome";
  switch (browserName.toLowerCase()) {
    case "chromium":
    case "chrome":
      return [
        {
          name: "chrome",
          use: { channel: "chrome", ...devices["Desktop Chrome"] },
        },
      ];
    case "edge":
    case "msedge":
      return [
        {
          name: "edge",
          use: { channel: "msedge", ...devices["Desktop Edge"] },
        },
      ];
    case "firefox":
      return [
        {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] },
        },
      ];
    case "webkit":
    case "safari":
      return [{ name: "safari", use: { ...devices["Desktop Safari"] } }];
    default:
      throw new Error(`Unsupported browser: ${browserName}`);
  }
}
