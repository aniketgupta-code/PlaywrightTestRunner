import { test } from "@playwright/test";
import { fetchCredentials } from "../../utils/credentials";
import { envBaseUrls, targetEnv, currentTestStatus } from "../../utils";
import { CommonPage, DashboardPage, PlatformPage } from "../../pages";

test.describe("Login Functionality", () => {
  test.beforeEach(async ({ page }) => {
    const platformPage = new PlatformPage(page);
    await platformPage.navigateToBasePage(envBaseUrls[targetEnv].url);
  });

  test("TC_38545_LoginLogoutTest", async ({ page }) => {
    const cred = await fetchCredentials("external_user");
    const platformPage = new PlatformPage(page);
    const dashboardPage = new DashboardPage(page);
    const commonPage = new CommonPage(page);
    const email = cred.email;
    const password = cred.password;
    const otpToken = cred.secret;

    await platformPage.login(email, password, otpToken);
    await dashboardPage.waitForDashboardLoad();
    await commonPage.logout();
  });

  test.afterEach(async () => {
    const status = await currentTestStatus();
    console.log(`[afterEach] Test completed with status: ${status}`);
  });
});
