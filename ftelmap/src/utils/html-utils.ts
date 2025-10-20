/**
 * Utility functions for HTML manipulation
 */

/**
 * Strip HTML tags from a string and return plain text
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
