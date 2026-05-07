/**
 * Formats a list of strings by sorting them A-Z and replacing underscores with spaces.
 * @param {string[]} list - The list of strings to format.
 * @returns {string[]} The formatted and sorted list.
 */
export const formatList = (list) => {
  if (!list || !Array.isArray(list)) return [];
  return [...list]
    .sort((a, b) => a.localeCompare(b))
    .map((item) => item.replace(/_/g, " "));
};

/**
 * Formats a single string by replacing underscores with spaces.
 * @param {string} str - The string to format.
 * @returns {string} The formatted string.
 */
export const formatLabel = (str) => {
  if (!str) return "";
  return str.replace(/_/g, " ");
};
