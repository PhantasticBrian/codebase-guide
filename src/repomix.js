import { exec } from "child_process";
import { promisify } from "util";
import ora from "ora";
import chalk from "chalk";
import { CONFIG } from "./config.js";
import { RepomixError } from "./errors.js";
import { shouldBeQuiet, logError, parseIgnorePatterns } from "./utils.js";

const execAsync = promisify(exec);

export async function runRepomix(options = {}) {
  const quiet = shouldBeQuiet(options);
  const spinner = quiet ? null : ora("Packing codebase with repomix...").start();

  try {
    const allIgnorePatterns = [
      ...CONFIG.DEFAULT_IGNORE_PATTERNS,
      ...parseIgnorePatterns(options.additionalIgnore),
    ];

    const ignorePattern = allIgnorePatterns.join(",");
    const command = `npx --yes repomix --ignore "${ignorePattern}" --stdout`;

    const { stdout } = await execAsync(command);

    if (spinner) spinner.succeed("Codebase packed successfully");
    return stdout;
  } catch (error) {
    if (spinner) spinner.fail("Failed to run repomix");

    if (error.code === "ENOENT") {
      const message =
        "npm/npx command not found. Please ensure Node.js and npm are properly installed.";
      logError(message, quiet);
      if (!quiet) {
        console.error(chalk.cyan("Visit: https://nodejs.org/"));
      }
      throw new RepomixError(message, error);
    } else {
      const message = `Error running repomix: ${error.message}`;
      logError(message, quiet);
      throw new RepomixError(message, error);
    }
  }
}
