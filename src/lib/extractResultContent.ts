import type { ToolResult, ContentObject } from '@/types/widgets';

/**
 * Extracts string content from a result object that may have various formats.
 * Handles string content, object with text property, arrays, and JSON objects.
 *
 * @param result - The result object to extract content from (can be undefined)
 * @returns The extracted string content, or empty string if no content found
 */
export function extractResultContent(result?: ToolResult): string {
  if (!result || !result.content) {
    return '';
  }

  if (typeof result.content === 'string') {
    return result.content;
  }

  if (typeof result.content === 'object') {
    const contentObj = result.content as ContentObject | ContentObject[];

    // Check for text property first
    if (!Array.isArray(contentObj) && contentObj.text) {
      return contentObj.text;
    }

    // Handle array content
    if (Array.isArray(contentObj)) {
      return contentObj
        .map((c: ContentObject | string) => (typeof c === 'string' ? c : c.text || JSON.stringify(c)))
        .join('\n');
    }

    // Fallback to JSON stringification for other objects
    return JSON.stringify(result.content, null, 2);
  }

  return '';
}
