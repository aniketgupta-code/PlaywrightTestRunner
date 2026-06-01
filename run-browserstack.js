const { execSync } = require("child_process");
const { config: dotenv } = require("dotenv");

dotenv({ path: "./configs/.env" });

const version = require("@playwright/test/package.json").version;

process.env.BROWSERSTACK_SDK = "true";
process.env.BROWSERSTACK_PLAYWRIGHT_VERSION = version;

const args = process.argv.slice(2).join(" ");

execSync(`browserstack-node-sdk playwright test ${args}`, { stdio: "inherit" });

// This is a temporary script to run BrowserStack tests locally using the BrowserStack Node SDK
// It sets the necessary environment variables and executes the BrowserStack Playwright test command
// Usage: node run-browserstack.js [additional playwright test args]
// Example: node run-browserstack.js --grep @smoke
