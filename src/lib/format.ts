// Currency and Date formatting utilities per PRD §5.7 FR-FIN-8

/**
 * Formats a number to Indian Rupees format (e.g. ₹12,000.00 or ₹12,000)
 */
export function formatINR(amount: number | null | undefined, showDecimals = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Formats date into readable string (e.g. 14 Nov 2026)
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
