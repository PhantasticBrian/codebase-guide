#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import chalk from "chalk";
import { CONFIG } from "./src/config.js";
import { CodebaseGuideError } from "./src/errors.js";
import { shouldBeQuiet, validateGoal } from "./src/utils.js";
import { runRepomix } from "./src/repomix.js";
import { callGeminiAPI } from "./src/gemini.js";
import { copyToClipboard } from "./src/clipboard.js";
import { readStdin } from "./src/input.js";

const program = new Command();






async function main(goal, options) {
  const quiet = shouldBeQuiet(options);

  try {
    goal = validateGoal(goal);

    if (!quiet) {
      console.log(chalk.blue("🤖 Codebase Guide\n"));
      console.log(chalk.cyan("Goal:"), goal);
      console.log("");
    }

    // Step 1: Run repomix to get codebase
    const codebase = await runRepomix(options);

    // Step 2: Call Gemini API for analysis
    const analysis = await callGeminiAPI(codebase, goal, options);

    // Step 3: Display results
    if (!quiet) {
      console.log(chalk.green("\n✨ Analysis Complete!\n"));
      console.log(chalk.gray("─".repeat(80)));
      console.log(analysis);
      console.log(chalk.gray("─".repeat(80)));
    } else {
      // For piping, just output the analysis
      console.log(analysis);
    }

    // Step 4: Copy to clipboard if requested
    if (options.copy && !quiet) {
      await copyToClipboard(analysis, quiet);
    }
  } catch (error) {
    if (error instanceof CodebaseGuideError) {
      process.exit(error.exitCode);
    } else {
      if (!quiet) {
        console.error(chalk.red("\n❌ Unexpected error:"), error.message);
      } else {
        console.error("Unexpected error:", error.message);
      }
      process.exit(1);
    }
  }
}

// CLI setup
program
  .name("codebase-guide")
  .description("Analyze your codebase with AI guidance using repomix and Gemini")
  .version("1.0.0")
  .argument(
    "[goal]",
    "The goal or objective you want to achieve with your codebase (optional, can be piped via stdin)"
  )
  .option("-c, --copy", "Copy the analysis result to clipboard")
  .option("--model <model>", "Gemini model to use", CONFIG.MODEL_ID)
  .option(
    "--additional-ignore <patterns>",
    "Additional ignore patterns for repomix (comma-separated)"
  )
  .option("-q, --quiet", "Suppress progress indicators for piping")
  .option("-p, --pipe", "Force pipe mode (output only the analysis result)")
  .option("-v, --verbose", "Enable verbose output, including the Gemini prompt")
  .action(async (goal, options) => {
    // If no goal provided as argument, try to read from stdin
    if (!goal) {
      // Read from stdin regardless of TTY status
      goal = await readStdin();
      if (!goal) {
        console.error("Error: No goal provided via argument or stdin");
        process.exit(1);
      }
    }

    await main(goal, options);
  });

program.parse();
