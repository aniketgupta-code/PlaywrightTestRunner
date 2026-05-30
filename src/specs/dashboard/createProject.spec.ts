import { test } from "@playwright/test";
import {
  targetEnv,
  envBaseUrls,
  currentTestData,
  fetchCredentials,
  currentTestStatus,
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
      const creds = await fetchCredentials("external_user");
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
      const cred = await fetchCredentials("architect_reviewer");
      const testData = currentTestData();
      const platformPage = new PlatformPage(page);
      const dashboardPage = new DashboardPage(page);
      await platformPage.login(cred.email, cred.password, cred.secret);
      await dashboardPage.waitForDashboardLoad();
      await dashboardPage.searchAndOpenProject(testData.projectName);
    },
  );

  test.afterEach(async () => {
    const status = await currentTestStatus();
    console.log(`[afterEach] Test completed with status: ${status}`);
  });
});
