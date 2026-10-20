/**
 * PromptWars Formatting & Domain Utility Functions
 * Safe currency, percentage, and date display calculations.
 */

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const symbolMap: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
  };

  const symbol = symbolMap[currency.toUpperCase()] || `${currency} `;
  return `${symbol}${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

export function isValidStatusTransition(
  current: "draft" | "planned" | "active" | "completed" | "cancelled",
  next: "draft" | "planned" | "active" | "completed" | "cancelled"
): boolean {
  if (current === next) return true;
  if (current === "cancelled") return false; // terminal
  if (current === "completed" && next === "draft") return false; // cannot revert completed to draft

  const allowed: Record<string, string[]> = {
    draft: ["planned", "cancelled"],
    planned: ["active", "cancelled", "draft"],
    active: ["completed", "cancelled", "planned"],
    completed: ["active"],
  };

  return (allowed[current] || []).includes(next);
}
