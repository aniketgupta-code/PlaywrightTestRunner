import { Page, expect, Locator } from "@playwright/test";
import { generateOtp } from "../utils";
import { CommonPage } from "../pages";

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

  async navigateToBasePage(url: string): Promise<void> {
    console.log(`[navigateToBasePage] Navigating to ${url}`);
    await this.page.goto(url);
    await this.page.waitForTimeout(2_000);
    await this.page.waitForLoadState("networkidle");
    console.log("[navigateToBasePage] Navigation complete");
    console.log(
      "[navigateToBasePage] Waiting for Sign In text and Continue button",
    );
    await expect(this.signInText).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.continueButton).toBeVisible({
      timeout: 30_000,
    });
    console.log("[navigateToBasePage] Login page loaded");
  }

  async login(
    email: string,
    password: string,
    otpToken?: string,
  ): Promise<void> {
    console.log(`[login] Logging in as ${email}`);
    if (email.includes("@allegion.com")) {
      await this.loginInternalUser(email, password);
    } else {
      await this.loginExternalUser(email, password, otpToken);
    }
  }

  async loginInternalUser(email: string, password: string): Promise<void> {
    console.log(
      "[loginInternalUser] Internal user login flow not yet implemented",
    );
    // Internal users have a different login flow, so we handle them separately.
  }

  async loginExternalUser(
    email: string,
    password: string,
    otpToken?: string,
  ): Promise<void> {
    console.log("[loginExternalUser] Filling email");
    await this.emailInput.isVisible({ timeout: 15_000 });
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(1_000);
    console.log("[loginExternalUser] Clicking Continue");
    await this.continueButton.click();
    console.log("[loginExternalUser] Filling password");
    await this.passwordInput.isVisible({ timeout: 15_000 });
    await this.passwordInput.fill(password);
    await this.page.waitForTimeout(1_000);
    console.log("[loginExternalUser] Clicking Sign In");
    await this.signInButton.click();
    console.log("[loginExternalUser] Filling OTP");
    await this.otpInput.isVisible({ timeout: 15_000 });
    await this.otpInput.fill(await generateOtp(otpToken));
    console.log("[loginExternalUser] Submitting OTP");
    await this.continueButton.click();
  }
}
