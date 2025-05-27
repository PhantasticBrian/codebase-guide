export class CodebaseGuideError extends Error {
  constructor(message, code = "GENERAL_ERROR", exitCode = 1) {
    super(message);
    this.name = "CodebaseGuideError";
    this.code = code;
    this.exitCode = exitCode;
  }
}

export class RepomixError extends CodebaseGuideError {
  constructor(message, originalError) {
    super(message, "REPOMIX_ERROR");
    this.originalError = originalError;
  }
}

export class GeminiAPIError extends CodebaseGuideError {
  constructor(message, originalError) {
    super(message, "GEMINI_API_ERROR");
    this.originalError = originalError;
  }
}

export class ConfigError extends CodebaseGuideError {
  constructor(message) {
    super(message, "CONFIG_ERROR");
  }
}
