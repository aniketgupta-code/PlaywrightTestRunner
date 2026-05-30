import { test, expect } from "@playwright/test";
import {
  targetEnv,
  envBaseUrls,
  currentTestData,
  fetchCredentials,
} from "../../utils";
import { DashboardPage, PlatformPage, CommonPage } from "../../pages";
import moment from "moment";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    const platformPage = new PlatformPage(page);
    const commonPage = new CommonPage(page);
    await commonPage.navigateTo(envBaseUrls[targetEnv].url);
    await platformPage.verifyLogoAndWelcomeText();
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

      const projectName = `${testData.projectNamePrefix}${moment().format("YYYYMMDD_HHmmss")}`;
      console.log("Creating Project:", projectName);

      await dashboardPage.clickCreateNewProjectButton();
      await dashboardPage.createProjectDialog.create(projectName);
      await dashboardPage.verifyProjectCreated();
    },
  );

  // test(
  //   "TC_38547_SearchProject",
  //   { tag: ["@dashboard", "@regression"] },
  //   async ({ page }) => {
  //     const creds = await fetchCredentials("architect_reviewer");
  //     await PlatformPage.login(page, creds.email, creds.password);

  //     await DashboardPage.searchProject(page, "AUTOMATION_");
  //     await expect(
  //       page.locator('[data-testid="project-list-item"]').first(),
  //     ).toBeVisible({ timeout: 15_000 });
  //   },
  // );
});
