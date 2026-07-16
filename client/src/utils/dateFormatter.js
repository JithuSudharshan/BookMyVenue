/**
 * Format creation date helper (e.g. "June 2026")
 * @param {string} dateString 
 * @returns {string}
 */
export const formatMemberSince = (dateString) => {
  if (!dateString) return 'June 2026';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    return 'June 2026';
  }
};
