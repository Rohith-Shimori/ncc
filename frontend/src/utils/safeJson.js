/**
 * Safely parses a JSON string.
 * If parsing fails, it logs a warning and returns the fallback value.
 *
 * @param {string} text - The JSON string to parse.
 * @param {*} fallback - The fallback value if parsing fails (defaults to null).
 * @returns {*} The parsed object or the fallback value.
 */
export function safeJsonParse(text, fallback = null) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('[Safe JSON Parse] Failed to parse JSON. Error:', error.message, 'Input string:', text);
    return fallback;
  }
}
