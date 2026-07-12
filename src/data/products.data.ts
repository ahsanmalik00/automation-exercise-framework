// Products used in the feature files. Picked by catalogue name, never by
// index; these names are stable seed data on the site.
export const KNOWN_PRODUCTS = {
  blueTop: 'Blue Top',
  menTshirt: 'Men Tshirt',
} as const;

export const DEFAULT_CHECKOUT_PRODUCTS: string[] = [
  KNOWN_PRODUCTS.blueTop,
  KNOWN_PRODUCTS.menTshirt,
];
