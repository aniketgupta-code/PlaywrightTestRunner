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

  constructor(private readonly page: Page) {
    this.dialog = this.page.locator("app-create-project-dialog");
    this.dialogTitle = this.dialog.locator(
      "//span[contains(@class,'dialog-title')]",
    );
    this.nextButton = this.dialog.getByRole("button", { name: "Next" });
    this.stageChecker = this.dialog.locator("div.stage-name");
    this.projectTypeDropdown = this.dialog.locator(
      "//mat-select[@name='projectType']",
    );
    this.projectNameInput = this.dialog.locator("//input[@name='name']");
    this.requireHelpChecker = this.dialog.getByRole("radio", {
      name: "Require Help",
    });
    this.createProjectButton = this.dialog.getByRole("button", {
      name: "Create Project",
    });
  }

  async create(projectName: string): Promise<void> {
    await expect(this.projectNameInput).toBeVisible({ timeout: 15_000 });
    await this.projectNameInput.fill(projectName);
    await this.createProjectButton.click();
  }
}

export class DashboardPage {
  readonly newProjectButton: Locator;
  readonly projectSearchInput: Locator;
  readonly projectListItems: Locator;
  readonly createProjectDialog: CreateProjectDialog;
  readonly projectNameCells: Locator;

  constructor(private readonly page: Page) {
    this.newProjectButton = this.page.getByRole("button", {
      name: "Create New Project",
    });
    this.projectSearchInput = this.page.getByPlaceholder("Search projects");
    this.projectListItems = this.page.locator("table tbody tr");
    this.projectNameCells = this.projectListItems.locator("td:first-child");
    this.createProjectDialog = new CreateProjectDialog(this.page);
  }

  async clickCreateNewProjectButton(): Promise<void> {
    await this.newProjectButton.click();
    await this.page.waitForTimeout(1_000);
  }

  async searchProject(searchTerm: string): Promise<void> {
    await this.projectSearchInput.fill(searchTerm);
  }

  async verifyProjectCreated(): Promise<void> {
    await this.page.waitForTimeout(3_000);
    await expect(this.page).toHaveURL(/\/project\/\d+/i);
  }
}
