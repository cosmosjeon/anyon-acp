/**
 * Shared utilities for tool widgets
 */

/**
 * Get syntax highlighting language from file path
 */
export const getLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    yaml: "yaml",
    yml: "yaml",
    json: "json",
    xml: "xml",
    html: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    sql: "sql",
    md: "markdown",
    toml: "ini",
    ini: "ini",
    dockerfile: "dockerfile",
    makefile: "makefile"
  };
  return languageMap[ext || ""] || "text";
};

/**
 * Extract domain from URL for display
 */
export const getDomain = (urlString: string): string => {
  try {
    const urlObj = new URL(urlString);
    return urlObj.hostname;
  } catch {
    return urlString;
  }
};

/**
 * Common icon styles by file extension
 */
export const getFileIconColor = (ext: string | undefined): string => {
  const colorMap: Record<string, string> = {
    rs: "text-orange-500",
    toml: "text-yellow-500",
    yaml: "text-yellow-500",
    yml: "text-yellow-500",
    json: "text-yellow-500",
    md: "text-blue-400",
    js: "text-yellow-400",
    jsx: "text-yellow-400",
    ts: "text-yellow-400",
    tsx: "text-yellow-400",
    py: "text-blue-500",
    go: "text-cyan-500",
    sh: "text-green-500",
    bash: "text-green-500",
  };
  return colorMap[ext || ""] || "text-muted-foreground";
};
