// src/utils/textHelpers.ts

/**
 * Extracts tagged usernames from a post's content (e.g. @andrew, @devgirl).
 * Returns an array of strings without the "@" prefix.
 */
export const extractUsernames = (text: string): string[] => {
  const matches = text.match(/@(\w+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
};
