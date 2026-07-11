/**
 * Products referenced by the feature files. Selected by their catalogue name
 * (never by numeric index) — these names are stable seed data on the site.
 */
export const KNOWN_PRODUCTS = {
  blueTop: 'Blue Top',
  menTshirt: 'Men Tshirt',
} as const;

export const DEFAULT_CHECKOUT_PRODUCTS: string[] = [
  KNOWN_PRODUCTS.blueTop,
  KNOWN_PRODUCTS.menTshirt,
];
