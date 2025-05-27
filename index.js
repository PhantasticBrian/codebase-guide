#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { exec } from "child_process";
import { promisify } from "util";
import axios from "axios";
import clipboardy from "clipboardy";
import chalk from "chalk";
import ora from "ora";

const execAsync = promisify(exec);
const program = new Command();

// Configuration
const MODEL_ID = "gemini-2.5-pro-preview-05-06";
const GENERATE_CONTENT_API = "generateContent";

// Check if we're in a pipe or TTY
const isInPipe = !process.stdin.isTTY || !process.stdout.isTTY;

const getAnalysisPrompt = (
  codebase,
  goal
) => `You are an AI assistant tasked with analyzing a codebase and providing guidance for achieving a specific goal. Your role is to prepare a detailed guide that will help a developer understand the current state of the codebase and plan their approach to implementing the desired changes.

First, you will be presented with the entire codebase and a specific goal. The codebase will be enclosed in <codebase> tags, and the goal will be enclosed in <goal> tags.

<codebase>
${codebase}
</codebase>

<goal>
${goal}
</goal>

Analyze the provided codebase thoroughly. Focus on understanding the overall structure, including directories, files, and their relationships. Pay special attention to components that may be relevant to the specified goal.

Provide an overview of the codebase structure, focusing on elements that are likely to be important for achieving the goal. Include the following information:

1. A high-level description of the main directories and their purposes.
2. A list of key files that are most relevant to the goal, along with a brief description of their contents and functions.
3. Any important dependencies or relationships between files and components that are crucial for understanding the system.

Identify specific areas of the codebase that are most likely to require modifications or additions to achieve the goal. Explain why these areas are important and how they relate to the desired outcome.

Highlight any potential challenges or considerations that the developer should be aware of based on the current state of the codebase. This may include architectural constraints, coding patterns, or dependencies that could impact the implementation of the goal.

Summarize your findings and provide a suggested order of files or components to examine first when planning the implementation. Offer any additional insights that could help the developer start planning their approach.

Remember to focus solely on the current state of the codebase. Do not suggest or discuss any new files or modifications at this stage. Your task is to provide a clear understanding of the existing codebase as it relates to the specified goal.

Present your analysis and guidance in a clear, structured format using appropriate headings and bullet points where necessary. Respond in the format:

<goal> 
${goal}
</goal>

<analysis>
[ANALYSIS]
</analysis>

Ensure that your guidance is detailed, actionable, and directly relevant to the provided goal and codebase structure.`;

// Function to read from stdin
function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");

    // Show prompt if running in a TTY
    if (process.stdin.isTTY) {
      process.stdout.write("Enter your goal (press Ctrl+D when finished):\n");
    }

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      resolve(data.trim());
    });
  });
}

async function runRepomix(options = {}) {
  const quiet = options.quiet || options.pipe || isInPipe;
  const spinner = quiet ? null : ora("Packing codebase with repomix...").start();

  // Default ignore patterns for images and binary files
  const defaultIgnorePatterns = [
    // Image files
    "**/*.svg",
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.bmp",
    "**/*.tiff",
    "**/*.tif",
    "**/*.webp",
    "**/*.ico",
    "**/*.icns",
    // Video files
    "**/*.mp4",
    "**/*.avi",
    "**/*.mov",
    "**/*.wmv",
    "**/*.flv",
    "**/*.webm",
    "**/*.mkv",
    // Audio files
    "**/*.mp3",
    "**/*.wav",
    "**/*.flac",
    "**/*.aac",
    "**/*.ogg",
    "**/*.wma",
    // Archive files
    "**/*.zip",
    "**/*.rar",
    "**/*.7z",
    "**/*.tar",
    "**/*.gz",
    "**/*.bz2",
    // Font files
    "**/*.ttf",
    "**/*.otf",
    "**/*.woff",
    "**/*.woff2",
    "**/*.eot",
    // Binary executables
    "**/*.exe",
    "**/*.dll",
    "**/*.so",
    "**/*.dylib",
    // Other binary files
    "**/*.pdf",
    "**/*.doc",
    "**/*.docx",
    "**/*.xls",
    "**/*.xlsx",
    "**/*.ppt",
    "**/*.pptx",
  ];

  // Combine default patterns with user-specified additional patterns
  let allIgnorePatterns = [...defaultIgnorePatterns];
  if (options.additionalIgnore) {
    const userPatterns = options.additionalIgnore.split(",").map((p) => p.trim());
    allIgnorePatterns = [...allIgnorePatterns, ...userPatterns];
  }

  const ignorePattern = allIgnorePatterns.join(",");
  const command = `npx --yes repomix --ignore "${ignorePattern}" --stdout`;

  try {
    const { stdout } = await execAsync(command);
    if (spinner) spinner.succeed("Codebase packed successfully");
    return stdout;
  } catch (error) {
    if (spinner) spinner.fail("Failed to run repomix");

    if (error.code === "ENOENT") {
      if (!quiet) {
        console.error(chalk.red("\n❌ Error: npm/npx command not found."));
        console.error(chalk.yellow("Please ensure Node.js and npm are properly installed."));
        console.error(chalk.cyan("Visit: https://nodejs.org/"));
      } else {
        console.error(
          "Error: npm/npx command not found. Please ensure Node.js and npm are properly installed."
        );
      }
    } else {
      if (!quiet) {
        console.error(chalk.red("\n❌ Error running repomix:"), error.message);
      } else {
        console.error("Error running repomix:", error.message);
      }
    }

    process.exit(1);
  }
}

async function callGeminiAPI(codebase, goal, options = {}) {
  const quiet = options.quiet || options.pipe || isInPipe;
  const spinner = quiet ? null : ora("Analyzing codebase with Gemini AI...").start();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (spinner) spinner.fail("Gemini API key not found");
    if (!quiet) {
      console.error(chalk.red("\n❌ Error: GEMINI_API_KEY environment variable not set."));
      console.error(chalk.yellow("Please set your Gemini API key:"));
      console.error(chalk.cyan('  export GEMINI_API_KEY="your-api-key-here"'));
    } else {
      console.error("Error: GEMINI_API_KEY environment variable not set.");
    }
    process.exit(1);
  }

  const prompt = getAnalysisPrompt(codebase, goal);

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "text/plain",
    },
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${apiKey}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // 2 minutes timeout for large codebases
      }
    );

    if (spinner) spinner.succeed("Analysis completed");

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    if (spinner) spinner.fail("Failed to analyze with Gemini AI");

    if (error.response) {
      if (!quiet) {
        console.error(
          chalk.red("\n❌ API Error:"),
          error.response.status,
          error.response.statusText
        );
        if (error.response.data) {
          console.error(chalk.red("Response:"), JSON.stringify(error.response.data, null, 2));
        }
      } else {
        console.error("API Error:", error.response.status, error.response.statusText);
      }
    } else if (error.code === "ECONNABORTED") {
      if (!quiet) {
        console.error(chalk.red("\n❌ Error: Request timed out. The codebase might be too large."));
        console.error(
          chalk.yellow("Try using repomix with additional filters to reduce the size:")
        );
        console.error(
          chalk.cyan('  npx --yes repomix --ignore "**/*.log,tmp/,node_modules/" --stdout')
        );
        console.error(chalk.gray("Note: Images and binary files are already excluded by default."));
      } else {
        console.error("Error: Request timed out. The codebase might be too large.");
      }
    } else {
      if (!quiet) {
        console.error(chalk.red("\n❌ Error:"), error.message);
      } else {
        console.error("Error:", error.message);
      }
    }

    process.exit(1);
  }
}

async function copyToClipboard(text) {
  try {
    await clipboardy.write(text);
    console.log(chalk.green("✅ Result copied to clipboard!"));
  } catch (error) {
    console.error(chalk.yellow("⚠️  Warning: Failed to copy to clipboard:"), error.message);
  }
}

async function main(goal, options) {
  const quiet = options.quiet || options.pipe || isInPipe;

  if (!quiet) {
    console.log(chalk.blue("🤖 Codebase Guide\n"));
    console.log(chalk.cyan("Goal:"), goal);
    console.log("");
  }

  try {
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
      await copyToClipboard(analysis);
    }
  } catch (error) {
    if (!quiet) {
      console.error(chalk.red("\n❌ Unexpected error:"), error.message);
    } else {
      console.error("Unexpected error:", error.message);
    }
    process.exit(1);
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
  .option("--model <model>", "Gemini model to use", MODEL_ID)
  .option(
    "--additional-ignore <patterns>",
    "Additional ignore patterns for repomix (comma-separated)"
  )
  .option("-q, --quiet", "Suppress progress indicators for piping")
  .option("-p, --pipe", "Force pipe mode (output only the analysis result)")
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
