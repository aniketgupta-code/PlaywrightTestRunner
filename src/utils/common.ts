import { Page, test } from "playwright/test";
import testData from "../data/testData.json";
import { generate, verify } from "otplib";
import { Logger } from "tslog";
import dotenv from "dotenv";

dotenv.config({ path: "./configs/.env" });
const browserstackSdk: boolean = JSON.parse(
  process.env.BROWSERSTACK_SDK ?? "false",
);

/** Current test environment (DEV | QA | UAT | PROD). Defaults to QA. */
export const targetEnv: string = (process.env.TARGET_ENV ?? "QA").toUpperCase();

/** Base URLs per environment, read from .env config. */
export const envBaseUrls: Record<string, { url: string }> = {
  DEV: { url: process.env.DEV_BASE_URL ?? "" },
  QA: { url: process.env.QA_BASE_URL ?? "" },
  UAT: { url: process.env.UAT_BASE_URL ?? "" },
  PROD: { url: process.env.PROD_BASE_URL ?? "" },
};

export function currentTestData(): Record<string, any> {
  const testName = test.info().title;
  return testData[testName] || {};
}

export async function generateOtp(
  secretKey: string,
): Promise<{ totp: string; timeRemaining: number }> {
  const totp = await generate({ secret: secretKey });
  const result = await verify({ secret: secretKey, token: totp });
  const timeRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);
  if (!result.valid) {
    throw new Error("Failed to generate valid OTP token");
  }
  return { totp, timeRemaining };
}

export async function currentTestStatus(): Promise<string> {
  const status = test.info().status;
  const error = test.info().error;
  logger.info(`[currentTestStatus] Test status: ${status}`);
  if (error) {
    logger.fatal(`[currentTestStatus] Test error: ${error.message}`);
  }
  return status;
}

export async function attachBrowserStackSessionLink(page: Page): Promise<void> {
  try {
    if (!browserstackSdk) return;
    const sessionDetailsRaw = (await page.evaluate(
      (_) => {},
      `browserstack_executor: {"action": "getSessionDetails"}`,
    )) as unknown as string;
    const sessionDetails = JSON.parse(sessionDetailsRaw);
    test.info().attach("BrowserStack Session Link", {
      body: sessionDetails.browser_url,
      contentType: "text/plain",
    });
  } catch (error) {
    logger.fatal(
      `[attachBrowserStackSessionLink] Failed to attach session link: ${(error as Error).message}`,
    );
  }
}

export const logger = new Logger({
  prettyLogTemplate:
    "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{filePathWithLine}}{{name}}]\t",
  prettyErrorTemplate:
    "\n{{errorName}} {{errorMessage}}\nerror stack:\n{{errorStack}}",
  prettyErrorStackTemplate:
    "  • {{fileName}}\t{{method}}\n\t{{filePathWithLine}}",
  prettyErrorParentNamesSeparator: ":",
  prettyErrorLoggerNameDelimiter: "\t",
  stylePrettyLogs: true,
  prettyLogTimeZone: "local",
  prettyLogStyles: {
    logLevelName: {
      "*": ["bold", "black", "bgWhiteBright", "dim"],
      SILLY: ["bold", "white"],
      TRACE: ["bold", "whiteBright"],
      DEBUG: ["bold", "green"],
      INFO: ["bold", "blue"],
      WARN: ["bold", "yellow"],
      ERROR: ["bold", "red"],
      FATAL: ["bold", "redBright"],
    },
    dateIsoStr: "white",
    filePathWithLine: "white",
    name: ["white", "bold"],
    nameWithDelimiterPrefix: ["white", "bold"],
    nameWithDelimiterSuffix: ["white", "bold"],
    errorName: ["bold", "bgRedBright", "whiteBright"],
    fileName: ["yellow"],
  },
});
