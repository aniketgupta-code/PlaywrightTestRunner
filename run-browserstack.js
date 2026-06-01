const { execSync } = require("child_process");
const { config: dotenv } = require("dotenv");

dotenv({ path: "./configs/.env" });

const version = require("@playwright/test/package.json").version;

process.env.BROWSERSTACK_SDK = "true";
process.env.BROWSERSTACK_PLAYWRIGHT_VERSION = version;

const args = process.argv.slice(2).join(" ");

execSync(`browserstack-node-sdk playwright test ${args}`, { stdio: "inherit" });
