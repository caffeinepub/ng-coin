/**
 * Utility functions for parsing and validating URLs in profile fields
 */

/**
 * Check if a string is a valid absolute URL (http/https)
 */
export function isValidUrl(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract valid URLs from a text string
 * Returns an array of valid URLs found in the text
 */
export function extractUrls(text: string): string[] {
  if (!text || text.trim() === '') {
    return [];
  }

  // Split by common delimiters (newlines, spaces, commas)
  const tokens = text.split(/[\s,\n]+/);
  
  const urls: string[] = [];
  
  for (const token of tokens) {
    const trimmed = token.trim();
    if (isValidUrl(trimmed)) {
      urls.push(trimmed);
    }
  }
  
  return urls;
}

/**
 * Get a display label for a URL (domain name)
 */
export function getUrlLabel(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
