import { test } from "@playwright/test";
import { fetchCredentials } from "../../utils/credentials";
import { envBaseUrls, targetEnv, currentTestStatus } from "../../utils";
import { CommonPage, DashboardPage, PlatformPage } from "../../pages";

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    const platformPage = new PlatformPage(page);
    await platformPage.navigateToBasePage(envBaseUrls[targetEnv].url);
  });

  test(
    "TC_38545_VerifyUserProfile",
    { tag: ["@profile", "@regression"] },
    async ({ page }) => {
      const cred = await fetchCredentials("support-user");
      const platformPage = new PlatformPage(page);
      const dashboardPage = new DashboardPage(page);
      const commonPage = new CommonPage(page);

      await platformPage.login(cred.email, cred.password, cred.secret);
      await dashboardPage.waitForDashboardLoad();
      await commonPage.openUserProfile();
      await commonPage.verifyUserProfile();
    },
  );

  test.afterEach(async () => {
    const status = await currentTestStatus();
    console.log(`[afterEach] Test completed with status: ${status}`);
  });
});
