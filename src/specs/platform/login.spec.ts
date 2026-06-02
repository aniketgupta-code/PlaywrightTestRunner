import { test } from "@playwright/test";
import { fetchCredentials, logger } from "../../utils";
import {
  envBaseUrls,
  targetEnv,
  currentTestStatus,
  attachBrowserStackSessionLink,
} from "../../utils";
import { CommonPage, DashboardPage, PlatformPage } from "../../pages";

test.describe("Login Functionality", () => {
  test.beforeEach(async ({ page }) => {
    const platformPage = new PlatformPage(page);
    await platformPage.navigateToBasePage(envBaseUrls[targetEnv].url);
  });

  test(
    "TC_38545_LoginLogoutTest",
    { tag: ["@login", "@smoke", "@regression"] },
    async ({ page }) => {
      const cred = await fetchCredentials("demo-user");
      const platformPage = new PlatformPage(page);
      const dashboardPage = new DashboardPage(page);
      const commonPage = new CommonPage(page);

      await platformPage.login(cred.email, cred.password, cred.secret);
      await dashboardPage.waitForDashboardLoad();
      await commonPage.logout();
    },
  );

  test.afterEach(async ({ page }) => {
    const status = await currentTestStatus();
    await attachBrowserStackSessionLink(page);
    logger.info(`[afterEach] Test completed with status: ${status}`);
  });
});
