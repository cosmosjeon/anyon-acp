/**
 * Port Detection Utility
 * Detects localhost ports from text output (e.g., dev server startup messages)
 */

const PORT_PATTERNS = [
  // Vite: "➜  Local:   http://localhost:5173/"
  /Local:\s*http:\/\/(?:localhost|127\.0\.0\.1):(\d+)/i,
  // Next.js: "ready - started server on 0.0.0.0:3000, url: http://localhost:3000"
  /url:\s*http:\/\/localhost:(\d+)/i,
  // Generic: "localhost:3000" or "127.0.0.1:3000"
  /(?:localhost|127\.0\.0\.1):(\d+)/i,
  // Express/Node: "listening on port 3000" or "Server listening on port 8080"
  /listening\s+(?:on\s+)?(?:port\s+)?(\d+)/i,
  // Create React App: "You can now view app in the browser. Local: http://localhost:3000"
  /Local:\s*http:\/\/[^:]+:(\d+)/i,
  // Webpack: "Project is running at http://localhost:8080/"
  /running at http:\/\/localhost:(\d+)/i,
  // Generic ready message with port
  /ready.*?(?:localhost|127\.0\.0\.1):(\d+)/i,
  // VITE specific format
  /VITE\s+v[\d.]+.*?localhost:(\d+)/i,
];

/**
 * Detects a localhost port from text content
 * @param content - Text content to search for port patterns
 * @returns The detected port number, or null if not found
 */
export function detectPortFromMessage(content: string): number | null {
  if (!content || typeof content !== 'string') {
    return null;
  }

  for (const pattern of PORT_PATTERNS) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const port = parseInt(match[1], 10);
      // Valid port range: 1024-65535 (user ports)
      if (port >= 1024 && port <= 65535) {
        return port;
      }
    }
  }
  return null;
}

/**
 * Extracts all ports found in text content
 * @param content - Text content to search
 * @returns Array of detected port numbers (unique, sorted)
 */
export function detectAllPortsFromMessage(content: string): number[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const ports = new Set<number>();

  for (const pattern of PORT_PATTERNS) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const port = parseInt(match[1], 10);
      if (port >= 1024 && port <= 65535) {
        ports.add(port);
      }
    }
  }

  return Array.from(ports).sort((a, b) => a - b);
}
