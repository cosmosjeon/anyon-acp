/**
 * Extracts string content from a result object that may have various formats.
 * Handles string content, object with text property, arrays, and JSON objects.
 *
 * @param result - The result object to extract content from
 * @returns The extracted string content, or empty string if no content found
 */
export function extractResultContent(result: any): string {
  if (!result || !result.content) {
    return '';
  }

  if (typeof result.content === 'string') {
    return result.content;
  }

  if (typeof result.content === 'object') {
    // Check for text property first
    if (result.content.text) {
      return result.content.text;
    }

    // Handle array content
    if (Array.isArray(result.content)) {
      return result.content
        .map((c: any) => (typeof c === 'string' ? c : c.text || JSON.stringify(c)))
        .join('\n');
    }

    // Fallback to JSON stringification for other objects
    return JSON.stringify(result.content, null, 2);
  }

  return '';
}
