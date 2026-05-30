import { FullConfig } from "@playwright/test";

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log("Global Teardown - Not implemented.");
}

export default globalTeardown;
