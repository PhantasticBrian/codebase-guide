import clipboardy from "clipboardy";
import { logSuccess, logError } from "./utils.js";

export async function copyToClipboard(text, quiet = false) {
  try {
    await clipboardy.write(text);
    logSuccess("Result copied to clipboard!", quiet);
  } catch (error) {
    logError(`Warning: Failed to copy to clipboard: ${error.message}`, quiet);
  }
}