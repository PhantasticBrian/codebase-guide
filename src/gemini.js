import axios from "axios";
import ora from "ora";
import chalk from "chalk";
import { CONFIG } from "./config.js";
import { GeminiAPIError, ConfigError } from "./errors.js";
import { shouldBeQuiet, logError } from "./utils.js";

export function getAnalysisPrompt(codebase, goal) {
  return `You are an AI assistant tasked with analyzing a codebase and providing guidance for achieving a specific goal. Your role is to prepare a detailed guide that will help a developer understand the current state of the codebase and plan their approach to implementing the desired changes.

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
}

export async function callGeminiAPI(codebase, goal, options = {}) {
  const quiet = shouldBeQuiet(options);
  const spinner = quiet ? null : ora("Analyzing codebase with Gemini AI...").start();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (spinner) spinner.fail("Gemini API key not found");
    const message = "GEMINI_API_KEY environment variable not set.";
    logError(message, quiet);
    if (!quiet) {
      console.error(chalk.yellow("Please set your Gemini API key:"));
      console.error(chalk.cyan('  export GEMINI_API_KEY="your-api-key-here"'));
    }
    throw new ConfigError(message);
  }

  const modelId = options.model || CONFIG.MODEL_ID;
  const prompt = getAnalysisPrompt(codebase, goal);

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "text/plain",
    },
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:${CONFIG.GENERATE_CONTENT_API}?key=${apiKey}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
        timeout: CONFIG.API_TIMEOUT,
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
      const message = `API Error: ${error.response.status} ${error.response.statusText}`;
      logError(message, quiet);
      if (!quiet && error.response.data) {
        console.error(chalk.red("Response:"), JSON.stringify(error.response.data, null, 2));
      }
      throw new GeminiAPIError(message, error);
    } else if (error.code === "ECONNABORTED") {
      const message = "Request timed out. The codebase might be too large.";
      logError(message, quiet);
      if (!quiet) {
        console.error(
          chalk.yellow("Try using repomix with additional filters to reduce the size:")
        );
        console.error(
          chalk.cyan('  npx --yes repomix --ignore "**/*.log,tmp/,node_modules/" --stdout')
        );
        console.error(chalk.gray("Note: Images and binary files are already excluded by default."));
      }
      throw new GeminiAPIError(message, error);
    } else {
      const message = `Error: ${error.message}`;
      logError(message, quiet);
      throw new GeminiAPIError(message, error);
    }
  }
}
