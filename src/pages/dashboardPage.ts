import { Page, Locator, expect } from "@playwright/test";

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
    console.log("[createProject] Waiting for dialog to be visible");
    await expect(this.dialog).toBeVisible({
      timeout: 5_000,
    });
    await expect(this.dialogTitle).toHaveText("Create New Project");
    await this.page.waitForTimeout(1_000);
    console.log("[createProject] Selecting 'Design' stage");
    await this.dynamicSelectors.stageChecker("Design").click();
    console.log("[createProject] Clicking Next");
    await this.nextButton.click();
    await this.page.waitForTimeout(1_000);
    await expect(this.dialogTitle).toHaveText("Create New Project");
    console.log("[createProject] Selecting project type 'Demo/Training'");
    await this.projectTypeDropdown.click();
    await this.dynamicSelectors.projectTypeOption("Demo/Training").click();
    await this.page.waitForTimeout(500);
    console.log(`[createProject] Filling project name: ${projectName}`);
    await this.projectNameInput.fill(projectName);
    console.log("[createProject] Selecting 'No' for require help");
    await this.dynamicSelectors.requireHelpOption("No").check();
    console.log("[createProject] Clicking Create Project");
    await this.createProjectButton.click();
    console.log("[createProject] Waiting for network idle");
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
    console.log("[waitForDashboardLoad] Waiting for New Project button");
    await expect(this.newProjectButton).toBeVisible({
      timeout: 10_000,
    });
    console.log("[waitForDashboardLoad] Waiting for search input");
    await expect(this.projectSearchInput).toBeVisible({
      timeout: 10_000,
    });
    console.log("[waitForDashboardLoad] Waiting for project list to populate");
    await expect(this.projectListItems.first()).toBeVisible({
      timeout: 30_000,
    });
    await this.page.waitForTimeout(5_000);
    console.log("[waitForDashboardLoad] Dashboard loaded");
  }

  async clickCreateNewProjectButton(): Promise<void> {
    console.log("[clickCreateNewProjectButton] Clicking Create New Project");
    await this.newProjectButton.click();
    await this.page.waitForTimeout(1_000);
  }

  async verifyProjectCreated(): Promise<void> {
    console.log("[verifyProjectCreated] Verifying URL contains project ID");
    await this.page.waitForURL(/\/projects\/\d+/i, {
      timeout: 10_000,
    });
    await expect(this.page).toHaveURL(/\/projects\/\d+/i);
    await this.page.waitForTimeout(5_000);
    console.log("[verifyProjectCreated] Project created successfully");
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
