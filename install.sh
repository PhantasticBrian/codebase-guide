#!/bin/bash

# Codebase Guide Installation Script
set -e

echo "🤖 Installing Codebase Guide..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) found"

# Check if npm is installed
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm $(npm --version) found"

# Check repomix availability via npx
print_status "Checking repomix availability..."
if ! command -v npx &> /dev/null; then
    print_error "npx is not available. Please ensure Node.js and npm are properly installed."
    exit 1
fi

# Test npx repomix
print_status "Testing repomix via npx..."
if npx --yes repomix --help > /dev/null 2>&1; then
    print_success "repomix is accessible via npx"
else
    print_warning "repomix test failed, but this might be due to network issues"
    print_status "The tool will automatically download repomix when needed"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Install globally
print_status "Installing codebase-guide globally..."
npm install -g .

print_success "Installation completed!"
echo ""

# Check for API key
print_status "Checking for Gemini API key..."
if [ -z "$GEMINI_API_KEY" ]; then
    print_warning "GEMINI_API_KEY environment variable not set"
    echo ""
    echo "To get started:"
    echo "1. Get your API key from: https://aistudio.google.com/app/apikey"
    echo "2. Set the environment variable:"
    echo "   export GEMINI_API_KEY=\"your-api-key-here\""
    echo "3. Add it to your shell profile to make it permanent:"
    echo "   echo 'export GEMINI_API_KEY=\"your-api-key-here\"' >> ~/.zshrc"
    echo ""
else
    print_success "GEMINI_API_KEY found"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Usage:"
echo "  codebase-guide \"Add user authentication with JWT tokens\""
echo "  codebase-guide \"Implement REST API\" --copy"
echo ""
echo "For help:"
echo "  codebase-guide --help"
echo ""

# Test installation
print_status "Testing installation..."
if command -v codebase-guide &> /dev/null; then
    print_success "codebase-guide command is available"
    echo ""
    echo "Try it out:"
    echo "  cd /path/to/your/project"
    echo "  codebase-guide \"Your development goal here\""
else
    print_error "Installation verification failed"
    echo "You may need to restart your terminal or run:"
    echo "  source ~/.bashrc  # or ~/.zshrc"
fi
