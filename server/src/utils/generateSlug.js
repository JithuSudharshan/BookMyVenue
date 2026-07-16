/**
 * Generates a URL-friendly slug from a given string.
 * Example: "Royal Palace Hall" -> "royal-palace-hall"
 * 
 * @param {string} name - The original name string
 * @returns {string} - The generated slug
 */
export const generateSlug = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word characters (excluding spaces and hyphens)
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with a single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};
