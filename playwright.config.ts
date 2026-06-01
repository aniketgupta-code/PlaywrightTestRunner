import { defineConfig } from "@playwright/test";
import isCI from "is-ci";
import dotenv from "dotenv";

dotenv.config({ path: "./configs/.env" });
dotenv.config({ path: "./configs/local.env" });

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

function buildGrepConfig(tagsEnv: string | undefined): {
  grep?: RegExp;
  grepInvert?: RegExp;
} {
  if (!tagsEnv) return {};

  const normalize = (t: string) => (t.startsWith("@") ? t : `@${t}`);
  const tags = tagsEnv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const included = tags.filter((t) => !t.startsWith("!")).map(normalize);

  const excluded = tags
    .filter((t) => t.startsWith("!"))
    .map((t) => normalize(t.slice(1)));

  return {
    grep: included.length ? new RegExp(included.join("|")) : undefined,
    grepInvert: excluded.length ? new RegExp(excluded.join("|")) : undefined,
  };
}

const { grep, grepInvert } = buildGrepConfig(process.env.TAGS);

export default defineConfig({
  testDir: "./src/specs",
  testMatch: "**/src/specs/**/*.spec.ts",
  fullyParallel: false,
  ...(!JSON.parse(process.env.BROWSERSTACK_SDK ?? "false") && {
    workers: workerCount,
    projects: browser(),
  }),
  retries: retryCount,
  timeout: 1_000_000,
  grep,
  grepInvert,
  forbidOnly: isCI ?? false,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  reporter: [
    ["list"],
    ["junit", { outputFile: "./reports/junit-results.xml" }],
    [
      "html",
      {
        outputFolder: "./reports/html",
        open:
          isCI || JSON.parse(process.env.BROWSERSTACK_SDK ?? "false")
            ? "never"
            : "on-failure",
      },
    ],
  ],
  outputDir: "./downloads/artifacts",
  use: {
    headless: headless,
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    screenshot: "only-on-failure",
    video: playwrightRecordVideo ? "retain-on-failure" : "off",
    trace: "retain-on-failure",
    viewport: {
      width: viewportWidth,
      height: viewportHeight,
    },
  },
});

function browser() {
  const browserName = process.env.BROWSER ?? "chromium";
  switch (browserName.toLowerCase()) {
    case "chromium":
      return [
        {
          name: "chromium",
          use: {},
        },
      ];
    case "chrome":
      return [
        {
          name: "chrome",
          use: { channel: "chrome" },
        },
      ];
    case "edge":
    case "msedge":
      return [
        {
          name: "edge",
          use: { channel: "msedge" },
        },
      ];
    case "firefox":
      return [
        {
          name: "firefox",
          use: {},
        },
      ];
    case "webkit":
    case "safari":
      return [{ name: "safari", use: {} }];
    default:
      throw new Error(`Unsupported browser: ${browserName}`);
  }
}
