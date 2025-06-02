# Codebase Guide

A powerful CLI tool that combines [Repomix](https://github.com/yamadashy/repomix) with Google Gemini AI to provide intelligent codebase analysis and guidance for achieving specific development goals.

## 🚀 Features

- **Intelligent Codebase Analysis**: Automatically packs your entire codebase using repomix
- **AI-Powered Guidance**: Leverages Google Gemini AI to understand your code structure and provide actionable insights
- **Goal-Oriented Analysis**: Focuses analysis on helping you achieve specific development objectives
- **Clipboard Integration**: Optional copying of results to clipboard for easy sharing
- **Beautiful CLI Interface**: Clean, colored output with progress indicators

## 📦 Installation

### Prerequisites

1. **Node.js**: Version 16 or higher
2. **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

> **Note**: Repomix is automatically downloaded and run via `npx`, so no global installation is required.

### Install the CLI Tool

1. **Clone or create the project files** (package.json and index.js from above)

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install globally**:

   ```bash
   npm install -g .
   ```

   Or use the included install script:

   ```bash
   chmod +x install.sh
   ./install.sh
   ```

   Or if you prefer to install directly from npm (after publishing):

   ```bash
   npm install -g codebase-guide
   ```

### Set Up Your API Key

Set your Gemini API key as an environment variable:

```bash
export GEMINI_API_KEY="your-gemini-api-key-here"
```

To make this permanent, add it to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
echo 'export GEMINI_API_KEY="your-gemini-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

## 🔧 Usage

### Basic Usage

Navigate to your project directory and run:

```bash
codebase-guide "Add user authentication with JWT tokens"
```

### Options

| Option                      | Alias | Description                                                         | Default                          |
| --------------------------- | ----- | ------------------------------------------------------------------- | -------------------------------- |
| `--copy`                    | `-c`  | Copy the analysis result to clipboard                              | `false`                          |
| `--model <model>`           |       | Gemini model to use                                                | `gemini-2.5-pro-preview-05-06`   |
| `--additional-ignore <patterns>` |  | Additional ignore patterns for repomix (comma-separated)           |                                  |
| `--quiet`                   | `-q`  | Suppress progress indicators for piping                            | `false`                          |
| `--pipe`                    | `-p`  | Force pipe mode (output only the analysis result)                  | `false`                          |
| `--verbose`                 | `-v`  | Enable verbose output, including the Gemini prompt sent to the API | `false`                          |

### Using stdin for goals

You can also pipe the goal via stdin:

```bash
echo "Add user authentication with JWT tokens" | codebase-guide
cat my_goal.txt | codebase-guide
```

### Files Ignored by Default

To keep the analysis focused on code and reduce processing time, the following file types are automatically ignored:

- **Images**: SVG, PNG, JPG, JPEG, GIF, BMP, TIFF, WebP, ICO, ICNS
- **Videos**: MP4, AVI, MOV, WMV, FLV, WebM, MKV
- **Audio**: MP3, WAV, FLAC, AAC, OGG, WMA
- **Archives**: ZIP, RAR, 7Z, TAR, GZ, BZ2
- **Fonts**: TTF, OTF, WOFF, WOFF2, EOT
- **Executables**: EXE, DLL, SO, DYLIB
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX

The tool also respects your `.gitignore` file and repomix's default ignore patterns.

### Copy Result to Clipboard

```bash
codebase-guide "Implement a REST API for blog posts" --copy
```

### Custom Gemini Model

Specify a different Gemini model (default is `gemini-2.5-pro-preview-05-06`):

```bash
codebase-guide "Your goal" --model "gemini-1.5-pro"
```

### Quiet Mode for Scripting

Suppress progress indicators for piping or scripting:

```bash
codebase-guide "Your goal" --quiet
```

### Pipe Mode

Force pipe mode to output only the analysis result:

```bash
codebase-guide "Your goal" --pipe
```

### Verbose Mode for Debugging

See the full prompt sent to Gemini:

```bash
codebase-guide "Your goal" --verbose
# or
codebase-guide "Your goal" -v
```

### Additional Ignore Patterns

By default, the tool ignores image files (SVG, PNG, JPG, etc.), binary files, and other non-text files to reduce the size of the analysis. You can add additional ignore patterns:

```bash
codebase-guide "Add user authentication" --additional-ignore "**/*.test.js,**/docs/**"
```

### Example Goals

Here are some example goals you can use:

```bash
# Feature Development
codebase-guide "Add real-time chat functionality using WebSockets"
codebase-guide "Implement user roles and permissions system"
codebase-guide "Add payment processing with Stripe integration"

# Code Quality & Architecture
codebase-guide "Refactor the codebase to use TypeScript"
codebase-guide "Implement comprehensive error handling"
codebase-guide "Add unit tests for the core business logic"

# Performance & Optimization
codebase-guide "Optimize database queries and add caching"
codebase-guide "Implement lazy loading for large datasets"
codebase-guide "Add monitoring and logging capabilities"

# Migration & Updates
codebase-guide "Migrate from Express to Fastify"
codebase-guide "Update React components to use hooks"
codebase-guide "Add Docker containerization"
```

## 📊 What You Get

The AI analysis provides:

1. **Codebase Overview**: High-level structure and key directories
2. **Relevant Files**: Files most important for your goal
3. **Dependencies & Relationships**: How components interact
4. **Implementation Areas**: Where to focus your changes
5. **Potential Challenges**: Issues to consider
6. **Action Plan**: Suggested order of implementation

## 🎯 Example Output

```
🤖 Codebase Guide

Goal: Add user authentication with JWT tokens

✓ Packing codebase with repomix...
✓ Analyzing codebase with Gemini AI...

✨ Analysis Complete!

────────────────────────────────────────────────────────────────────────────────
<analysis>

## Codebase Overview

Your Express.js application follows a standard MVC architecture with the following key directories:

### Key Directories
- `/src/routes/` - API endpoint definitions
- `/src/models/` - Database models and schemas
- `/src/middleware/` - Custom middleware functions
- `/src/controllers/` - Business logic handlers

## Relevant Files for JWT Authentication

1. **src/models/User.js** - User model that will need password hashing
2. **src/routes/auth.js** - Will need creation for auth endpoints
3. **src/middleware/auth.js** - JWT verification middleware to create
4. **package.json** - Dependencies to add (jsonwebtoken, bcrypt)

...

</analysis>
────────────────────────────────────────────────────────────────────────────────
✅ Result copied to clipboard!
```

## 🛠️ Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

### Command Aliases

You can use either `codebase-guide` or the shorter alias `cg`:

```bash
cg "Add user authentication with JWT tokens"
```

## 🔍 How It Works

1. **Codebase Packing**: Uses repomix to create a comprehensive snapshot of your codebase
2. **AI Analysis**: Sends your codebase and goal to Google Gemini for intelligent analysis
3. **Structured Guidance**: Receives detailed, actionable guidance tailored to your specific goal
4. **Result Display**: Shows the analysis in a clean, readable format

## 🚨 Troubleshooting

### "npm/npx command not found"

Ensure Node.js and npm are properly installed:

```bash
# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version
```

If not installed, visit [nodejs.org](https://nodejs.org/) to download and install Node.js (which includes npm).

### "GEMINI_API_KEY environment variable not set"

Set your API key:

```bash
export GEMINI_API_KEY="your-api-key-here"
```

### Request timeout for large codebases

Use additional ignore patterns to reduce size:

```bash
codebase-guide "Your goal" --additional-ignore "**/*.log,tmp/,node_modules/"
```

### API quota exceeded

Check your [Google AI Studio usage](https://aistudio.google.com/) and quota limits.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- [Repomix](https://github.com/yamadashy/repomix) - For excellent codebase packing
- [Google Gemini](https://deepmind.google/technologies/gemini/) - For powerful AI analysis
- [Commander.js](https://github.com/tj/commander.js/) - For CLI interface
