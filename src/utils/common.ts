import { Page, test } from "playwright/test";
import testData from "../data/testData.json";
import { generate, verify } from "otplib";

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

export async function generateOtp(secretKey: string): Promise<string> {
  const totp = await generate({ secret: secretKey });
  const result = await verify({ secret: secretKey, token: totp });
  if (!result) {
    throw new Error("Failed to generate valid OTP token");
  }
  return totp;
}

export async function currentTestStatus(): Promise<string> {
  const status = test.info().status;
  const error = test.info().error;
  console.log(`[currentTestStatus] Test status: ${status}`);
  if (error) {
    console.error(`[currentTestStatus] Test error: ${error.message}`);
  }
  return status;
}

export async function attachBrowserStackSessionLink(page: Page): Promise<void> {
  try {
    if (!browserstackSdk) return;
    const sessionDetailsString = await page.evaluate(
      () => 'browserstack_executor: {"action": "getSessionDetails"}',
    );
    const sessionDetails = JSON.parse(sessionDetailsString);
    test.info().attach("BrowserStack Session Link", {
      body: sessionDetails.browser_url,
      contentType: "text/plain",
    });
  } catch (error) {
    console.error(
      `[attachBrowserStackSessionLink] Failed to attach session link: ${(error as Error).message}`,
    );
  }
}
