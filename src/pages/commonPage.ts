import { Locator, Page } from "@playwright/test";

export class CommonPage {
  readonly listOptions: Locator;

  constructor(private readonly page: Page) {
    this.listOptions = this.page.locator("//div[@role='listbox']//mat-option");
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }
}
