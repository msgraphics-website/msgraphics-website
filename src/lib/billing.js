// Shared helpers for order items, bills and the daily report (staff pages).

export const UNITS = [
  { key: 'sqft', label: 'Sq ft' },
  { key: 'pcs', label: 'Pcs' },
  { key: 'rft', label: 'Running ft' },
  { key: 'set', label: 'Set' },
];
export const unitLabel = (k) => UNITS.find((u) => u.key === k)?.label ?? k;

const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? 0 : Number(v));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Same rule as the database (order_items.amount).
export function itemAmount(it) {
  const w = num(it.width), h = num(it.height), q = num(it.qty), r = num(it.rate);
  return round2(it.unit === 'sqft' && w > 0 && h > 0 ? w * h * q * r : q * r);
}
export const itemSqft = (it) => (it.unit === 'sqft' && num(it.width) > 0 && num(it.height) > 0 ? round2(num(it.width) * num(it.height) * num(it.qty)) : 0);

export function totals(items, o = {}) {
  const subtotal = round2(items.reduce((s, it) => s + itemAmount(it), 0));
  const discount = num(o.discount);
  const taxable = round2(subtotal - discount);
  const gstPercent = num(o.gst_percent);
  const gst = round2((taxable * gstPercent) / 100);
  const total = items.length ? round2(taxable + gst) : num(o.amount);
  const advance = num(o.advance);
  return { subtotal, discount, taxable, gstPercent, gst, total, advance, balance: round2(total - advance) };
}

export const inr = (n, decimals = true) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 });

// 1234567.5 → "Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven Rupees and Fifty Paise Only"
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const two = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''));
const three = (n) => (n >= 100 ? ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + two(n % 100) : '') : two(n));
function words(n) {
  if (n === 0) return 'Zero';
  const parts = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) parts.push(words(crore) + ' Crore');
  if (lakh) parts.push(two(lakh) + ' Lakh');
  if (thousand) parts.push(two(thousand) + ' Thousand');
  if (n) parts.push(three(n));
  return parts.join(' ');
}
export function amountInWords(amount) {
  const a = round2(Math.abs(num(amount)));
  const rupees = Math.floor(a), paise = Math.round((a - rupees) * 100);
  return `${words(rupees)} Rupees${paise ? ' and ' + two(paise) + ' Paise' : ''} Only`;
}

// Dates in India time (the shop's day), whatever the device clock zone is.
export const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
export function dayRangeIST(day) {
  const start = new Date(`${day}T00:00:00+05:30`);
  return { from: start.toISOString(), to: new Date(start.getTime() + 864e5).toISOString() };
}
