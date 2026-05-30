import { test } from "playwright/test";
import testData from "../data/testData.json";
import { generate, verify } from "otplib";

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
