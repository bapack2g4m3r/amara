/**
 * Standard date formatter across Amara Wedding Dashboard: dd/mm/yyyy
 * Example: '2026-10-24' -> '24/10/2026'
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';

  // Direct string parsing to prevent unexpected timezone shifts
  if (typeof dateInput === 'string') {
    const cleanDate = dateInput.split('T')[0];
    const match = cleanDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const year = match[1];
      const month = String(match[2]).padStart(2, '0');
      const day = String(match[3]).padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default formatDate;
