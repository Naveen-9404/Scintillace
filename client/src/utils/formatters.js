export function formatDate(value, options = {}) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', ...options }).format(new Date(value));
}
export function formatCurrency(value, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value ?? 0);
}
export function truncateText(value = '', limit = 120) { return value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value; }
