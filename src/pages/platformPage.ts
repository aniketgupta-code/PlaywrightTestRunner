import { Page, expect, Locator } from "@playwright/test";
import { generateOtp } from "../utils";

export class PlatformPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly otpInput: Locator;
  readonly signInText: Locator;
  readonly continueButton: Locator;
  readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = this.page.locator("input#username");
    this.passwordInput = this.page.locator("input#password");
    this.otpInput = this.page.locator("input#code");
    this.signInText = this.page.getByText("Sign In");
    this.continueButton = this.page.getByRole("button", { name: "Continue" });
    this.signInButton = this.page.getByRole("button", { name: "Sign In" });
  }

  async verifyLogoAndWelcomeText(): Promise<void> {
    await expect(this.signInText).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.continueButton).toBeVisible({
      timeout: 30_000,
    });
  }

  async login(
    email: string,
    password: string,
    otpToken?: string,
  ): Promise<void> {
    if (email.includes("@allegion.com")) {
      await this.loginInternalUser(email, password);
    } else {
      await this.loginExternalUser(email, password, otpToken);
    }
  }

  async loginInternalUser(email: string, password: string): Promise<void> {
    // Internal users have a different login flow, so we handle them separately.
  }

  async loginExternalUser(
    email: string,
    password: string,
    otpToken?: string,
  ): Promise<void> {
    await this.emailInput.isVisible({ timeout: 15_000 });
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(1_000);
    await this.continueButton.click();
    await this.passwordInput.isVisible({ timeout: 15_000 });
    await this.passwordInput.fill(password);
    await this.page.waitForTimeout(1_000);
    await this.signInButton.click();

    await this.otpInput.isVisible({ timeout: 15_000 });
    await this.otpInput.fill(await generateOtp(otpToken));
    await this.continueButton.click();
  }
}
