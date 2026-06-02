import { FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { logger } from "./src/utils";

async function globalSetup(_config: FullConfig): Promise<void> {
  for (const dir of ["reports", "downloads"]) {
    const resolved = path.resolve(dir);
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
      continue;
    }
    for (const entry of fs.readdirSync(resolved)) {
      fs.rmSync(path.join(resolved, entry), { recursive: true, force: true });
    }
  }
  logger.info("Global Setup - Output directories cleaned.");
}

export default globalSetup;
