import { test, expect } from "@playwright/test";
import { fetchCredentials } from "../../utils/credentials";
import { TARGET_ENV, envBaseUrls, currentTestData } from "../../utils/common";
import { CommonPage, PlatformPage } from "../../pages";

test.describe("Login Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await CommonPage.navigateToURL(page, envBaseUrls[TARGET_ENV].url);
    await PlatformPage.verifyLogoAndWelcomeText(page);
  });
  test("TC_38545_LoginTest", async ({ page }) => {
    const creds = await fetchCredentials("external_user");
    const email = creds.email;
    const password = creds.password;

    await PlatformPage.login(page, email, password);
  });
});
