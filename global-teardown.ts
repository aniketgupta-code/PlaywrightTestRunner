import { FullConfig } from "@playwright/test";
import { logger } from "./src/utils";

async function globalTeardown(_config: FullConfig): Promise<void> {
  logger.info("Global Teardown - Not implemented.");
}

export default globalTeardown;
