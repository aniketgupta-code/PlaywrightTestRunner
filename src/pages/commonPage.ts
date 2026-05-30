import { expect, Locator, Page } from "@playwright/test";
import { PlatformPage } from "./platformPage";

export class CommonPage {
  readonly settingsIcon: Locator;
  readonly settingsMenu: Locator;
  readonly dynamicSelectors = {
    menuOption: (optionName: string) =>
      this.settingsMenu.locator(
        `//span[normalize-space(text())='${optionName}']`,
      ),
  };

  constructor(private readonly page: Page) {
    this.settingsIcon = this.page.locator("//div[@role='menu']");
    this.settingsMenu = this.page.locator("app-settings-menu");
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
}
