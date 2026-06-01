import { expect, Locator, Page } from "@playwright/test";
import { PlatformPage } from "./platformPage";

class ProfilePage {
  readonly profileHeader: Locator;

  constructor(readonly page: Page) {
    this.profileHeader = this.page
      .getByText("Profile", { exact: true })
      .first();
  }

  async verifyUserProfile(): Promise<void> {
    console.log("[verifyUserProfile] Verifying user profile page");
    await this.page.bringToFront();

    await expect(this.profileHeader).toBeVisible({
      timeout: 30_000,
    });
    console.log("[verifyUserProfile] User profile page verified successfully");
    await this.page.waitForTimeout(2_000);
  }
}

export class CommonPage {
  profilePage: ProfilePage;
  readonly settingsIcon: Locator;
  readonly settingsMenu: Locator;
  readonly dynamicSelectors = {
    menuOption: (optionName: string) =>
      this.settingsMenu.locator(
        `//span[normalize-space(text())='${optionName}']`,
      ),
  };

  constructor(private readonly page: Page) {
    this.settingsIcon = this.page.locator("mat-icon.settings-icon");
    this.settingsMenu = this.page.locator("//div[@role='menu']");
  }

  async logout(): Promise<void> {
    console.log("[logout] Logging out");
    await this.settingsIcon.click();
    await this.page.waitForTimeout(500);
    await this.dynamicSelectors.menuOption("Logout").click();
    await this.page.waitForTimeout(2_000);
    const platformPage = new PlatformPage(this.page);
    await expect(platformPage.signInText).toBeVisible({
      timeout: 30_000,
    });
    console.log("[logout] Logout successful");
  }

  async openUserProfile(): Promise<void> {
    console.log("[openUserProfile] Opening user profile");
    await this.settingsIcon.click();
    await this.page.waitForTimeout(500);
    const context = this.page.context();
    const newPagePromise = context.waitForEvent("page", {
      predicate: (p) => p.url().includes("profile"),
      timeout: 10_000,
    });
    await this.dynamicSelectors.menuOption("Profile").click();
    const newPage = await newPagePromise;
    this.profilePage = new ProfilePage(newPage);
    await this.page.waitForTimeout(2_000);
    console.log("[openUserProfile] User profile opened");
  }

  async verifyUserProfile(): Promise<void> {
    if (!this.profilePage) {
      throw new Error(
        "Profile page is not initialized. Call openUserProfile() first.",
      );
    }
    await this.profilePage.verifyUserProfile();
    await this.page.bringToFront();
    await this.profilePage.page.close();
    console.log("[verifyUserProfile] User profile verified and closed");
    await this.page.waitForTimeout(5_000);
  }
}
