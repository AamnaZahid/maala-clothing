export function formatPrice(amount) {
  if (amount == null) return 'PKR 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `PKR ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
