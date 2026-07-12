// Turns a label like "Rs. 500" into 500.
export function parsePrice(label: string): number {
  const match = label.replace(/[,\s]/g, '').match(/(\d+)/);
  if (!match) {
    throw new Error(`Could not parse a price from "${label}"`);
  }
  return Number(match[1]);
}
