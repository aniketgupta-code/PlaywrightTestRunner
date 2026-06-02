import { test } from "@playwright/test";
import {
  logger,
  targetEnv,
  envBaseUrls,
  currentTestData,
  fetchCredentials,
  currentTestStatus,
  attachBrowserStackSessionLink,
} from "../../utils";
import { DashboardPage, PlatformPage, CommonPage } from "../../pages";
import moment from "moment";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    const platformPage = new PlatformPage(page);
    await platformPage.navigateToBasePage(envBaseUrls[targetEnv].url);
  });

  test(
    "TC_38546_CreateProject",
    { tag: ["@dashboard", "@regression"] },
    async ({ page }) => {
      const creds = await fetchCredentials("external-user");
      const email = creds.email;
      const password = creds.password;
      const otpToken = creds.secret;
      const testData = currentTestData();
      const platformPage = new PlatformPage(page);
      const dashboardPage = new DashboardPage(page);

      await platformPage.login(email, password, otpToken);
      await dashboardPage.waitForDashboardLoad();

      const projectName = `${testData.projectNamePrefix}${moment().format("YYYYMMDD_HHmmss")}`;

      await dashboardPage.clickCreateNewProjectButton();
      await dashboardPage.createProjectDialog.createProject(projectName);
      await dashboardPage.verifyProjectCreated();
    },
  );

  test(
    "TC_38547_SearchProject",
    { tag: ["@dashboard", "@smoke", "@regression"] },
    async ({ page }) => {
      const cred = await fetchCredentials("external-user");
      const testData = currentTestData();
      const platformPage = new PlatformPage(page);
      const dashboardPage = new DashboardPage(page);
      await platformPage.login(cred.email, cred.password, cred.secret);
      await dashboardPage.waitForDashboardLoad();
      await dashboardPage.searchAndOpenProject(testData.projectName);
    },
  );

  test.afterEach(async ({ page }) => {
    const status = await currentTestStatus();
    await attachBrowserStackSessionLink(page);
    logger.info(`[afterEach] Test completed with status: ${status}`);
  });
});
