export function fmt(cents) {
  return "$" + (cents / 100).toFixed(2);
}
