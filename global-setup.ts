import { FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

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
  console.log("Global Setup - Output directories cleaned.");
}

export default globalSetup;
