export function formatCurrency(amount: number, currency: string = 'XOF', minimumFractionDigits: number = 0): string {
  // FCFA et XOF sont souvent utilisés de façon interchangeable côté UI
  const normalizedCurrency = currency === 'FCFA' ? 'XOF' : currency;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits,
  }).format(amount);
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

