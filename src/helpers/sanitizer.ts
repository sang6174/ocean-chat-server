/**
 * Sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize message content to prevent XSS
 * Removes HTML special characters and dangerous patterns
 */
export function sanitizeMessage(message: string): string {
  if (typeof message !== "string") return "";

  // Remove HTML/script tags and dangerous characters
  return message
    .replace(/[<>\"']/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#x27;";
        default:
          return char;
      }
    })
    .trim();
}

/**
 * Sanitize user input text (names, usernames, etc)
 */
export function sanitizeText(text: string, maxLength: number = 255): string {
  if (typeof text !== "string") return "";

  return text
    .trim()
    .substring(0, maxLength)
    .replace(/[<>\"'`]/g, "");
}

/**
 * Validate and sanitize conversation name
 */
export function sanitizeConversationName(name: string): string {
  return sanitizeText(name, 100);
}

/**
 * Validate and sanitize username
 */
export function sanitizeUsername(username: string): string {
  return sanitizeText(username, 32).toLowerCase();
}
