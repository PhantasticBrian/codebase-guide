import chalk from "chalk";

export function shouldBeQuiet(options = {}) {
  const isInPipe = !process.stdin.isTTY || !process.stdout.isTTY;
  return options.quiet || options.pipe || isInPipe;
}

export function logError(message, quiet = false) {
  if (quiet) {
    console.error(message);
  } else {
    console.error(chalk.red(`❌ ${message}`));
  }
}

export function logSuccess(message, quiet = false) {
  if (quiet) {
    console.log(message);
  } else {
    console.log(chalk.green(`✅ ${message}`));
  }
}

export function logInfo(message, quiet = false) {
  if (quiet) {
    console.log(message);
  } else {
    console.log(chalk.blue(`ℹ️  ${message}`));
  }
}

export function validateGoal(goal) {
  if (!goal || typeof goal !== "string" || goal.trim().length === 0) {
    throw new Error("Goal must be a non-empty string");
  }
  return goal.trim();
}

export function parseIgnorePatterns(additionalIgnore) {
  if (!additionalIgnore) return [];
  return additionalIgnore
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}
