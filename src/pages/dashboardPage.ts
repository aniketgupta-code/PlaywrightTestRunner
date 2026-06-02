import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../utils";

class CreateProjectDialog {
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly nextButton: Locator;
  readonly stageChecker: Locator;
  readonly projectTypeDropdown: Locator;
  readonly projectNameInput: Locator;
  readonly requireHelpChecker: Locator;
  readonly createProjectButton: Locator;

  readonly dynamicSelectors = {
    stageChecker: (stageName: string) =>
      this.dialog.locator(`//div[normalize-space(text())='${stageName}']`),
    projectTypeOption: (typeName: string) =>
      this.page.locator(`//span[normalize-space(text())='${typeName}']`),
    requireHelpOption: (optionName: string) =>
      this.dialog.getByRole("radio", { name: optionName, exact: true }),
  };

  constructor(private readonly page: Page) {
    this.dialog = this.page.locator("app-create-project-dialog");
    this.dialogTitle = this.dialog.locator(
      "//span[contains(@class,'dialog-title')]",
    );
    this.nextButton = this.dialog.getByRole("button", { name: "Next" });
    this.projectTypeDropdown = this.dialog.locator(
      "//mat-select[@name='projectType']",
    );
    this.projectNameInput = this.dialog.locator("//input[@name='name']");
    this.createProjectButton = this.dialog.getByRole("button", {
      name: "Create Project",
    });
  }

  async createProject(projectName: string): Promise<void> {
    logger.info("[createProject] Waiting for dialog to be visible");
    await expect(this.dialog).toBeVisible({
      timeout: 5_000,
    });
    await expect(this.dialogTitle).toHaveText("Create New Project");
    await this.page.waitForTimeout(1_000);
    logger.info("[createProject] Selecting 'Design' stage");
    await this.dynamicSelectors.stageChecker("Design").click();
    logger.info("[createProject] Clicking Next");
    await this.nextButton.click();
    await this.page.waitForTimeout(1_000);
    await expect(this.dialogTitle).toHaveText("Create New Project");
    logger.info("[createProject] Selecting project type 'Demo/Training'");
    await this.projectTypeDropdown.click();
    await this.dynamicSelectors.projectTypeOption("Demo/Training").click();
    await this.page.waitForTimeout(500);
    logger.info(`[createProject] Filling project name: ${projectName}`);
    await this.projectNameInput.fill(projectName);
    logger.info("[createProject] Selecting 'No' for require help");
    await this.dynamicSelectors.requireHelpOption("No").check();
    logger.info("[createProject] Clicking Create Project");
    await this.createProjectButton.click();
    logger.info("[createProject] Waiting for network idle");
    await this.page.waitForTimeout(2_000);
    await this.page.waitForLoadState("networkidle");
  }
}

export class DashboardPage {
  readonly createProjectDialog: CreateProjectDialog;
  readonly newProjectButton: Locator;
  readonly projectSearchInput: Locator;
  readonly projectListItems: Locator;
  readonly projectNameCells: Locator;

  constructor(private readonly page: Page) {
    this.newProjectButton = this.page.getByRole("button", {
      name: "Create New Project",
    });
    this.projectSearchInput = this.page.getByPlaceholder("Search projects");
    this.projectListItems = this.page.locator("table tbody tr");
    this.projectNameCells = this.projectListItems.locator("td:nth-child(2)");
    this.createProjectDialog = new CreateProjectDialog(this.page);
  }

  async waitForDashboardLoad(): Promise<void> {
    logger.info("[waitForDashboardLoad] Waiting for New Project button");
    await expect(this.newProjectButton).toBeVisible({
      timeout: 10_000,
    });
    logger.info("[waitForDashboardLoad] Waiting for search input");
    await expect(this.projectSearchInput).toBeVisible({
      timeout: 10_000,
    });
    logger.info("[waitForDashboardLoad] Waiting for project list to populate");
    await expect(this.projectListItems.first()).toBeVisible({
      timeout: 30_000,
    });
    await this.page.waitForTimeout(5_000);
    logger.info("[waitForDashboardLoad] Dashboard loaded");
  }

  async clickCreateNewProjectButton(): Promise<void> {
    logger.info("[clickCreateNewProjectButton] Clicking Create New Project");
    await this.newProjectButton.click();
    await this.page.waitForTimeout(1_000);
  }

  async verifyProjectCreated(): Promise<void> {
    logger.info("[verifyProjectCreated] Verifying URL contains project ID");
    await this.page.waitForURL(/\/projects\/\d+/i, {
      timeout: 10_000,
    });
    await expect(this.page).toHaveURL(/\/projects\/\d+/i);
    await this.page.waitForTimeout(5_000);
    logger.info("[verifyProjectCreated] Project created successfully");
  }

  async searchAndOpenProject(searchTerm: string): Promise<void> {
    await this.projectSearchInput.fill(searchTerm);
    await this.page.waitForTimeout(2_000);
    await expect(this.projectNameCells.first()).toContainText(searchTerm, {
      timeout: 5_000,
    });
    await this.projectNameCells.first().click();
    await this.page.waitForTimeout(2_000);
    await this.page.waitForURL(/\/projects\/\d+/i, {
      timeout: 10_000,
    });
    await expect(this.page).toHaveURL(/\/projects\/\d+/i);
    await this.page.waitForTimeout(5_000);
  }
}
