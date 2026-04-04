export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number, currency = 'USD') {
  if (currency === 'IDR') {
    if (amount >= 1000000) {
      const m = amount / 1000000;
      return `IDR ${Number.isInteger(m) ? m : m.toFixed(1)}M`;
    }
    if (amount >= 1000) {
      const k = amount / 1000;
      return `IDR ${Number.isInteger(k) ? k : k.toFixed(1)}K`;
    }
    return `IDR ${Math.round(amount)}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}
