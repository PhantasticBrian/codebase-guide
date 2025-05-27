// Configuration constants
export const CONFIG = {
  MODEL_ID: "gemini-2.5-pro-preview-05-06",
  GENERATE_CONTENT_API: "generateContent",
  API_TIMEOUT: 120000, // 2 minutes
  CACHE_TTL: 300000, // 5 minutes
  DEFAULT_IGNORE_PATTERNS: [
    // Image files
    "**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.bmp",
    "**/*.tiff", "**/*.tif", "**/*.webp", "**/*.ico", "**/*.icns",
    // Video files
    "**/*.mp4", "**/*.avi", "**/*.mov", "**/*.wmv", "**/*.flv", "**/*.webm", "**/*.mkv",
    // Audio files
    "**/*.mp3", "**/*.wav", "**/*.flac", "**/*.aac", "**/*.ogg", "**/*.wma",
    // Archive files
    "**/*.zip", "**/*.rar", "**/*.7z", "**/*.tar", "**/*.gz", "**/*.bz2",
    // Font files
    "**/*.ttf", "**/*.otf", "**/*.woff", "**/*.woff2", "**/*.eot",
    // Binary executables
    "**/*.exe", "**/*.dll", "**/*.so", "**/*.dylib",
    // Other binary files
    "**/*.pdf", "**/*.doc", "**/*.docx", "**/*.xls", "**/*.xlsx", "**/*.ppt", "**/*.pptx",
  ]
};