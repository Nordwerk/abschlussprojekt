import {
  WORKWEAR_PRODUCTS,
  WORKWEAR_VIEWS_PER_PRODUCT,
  WORKWEAR_IMAGES,
  type WorkwearProductId,
} from "./constants";

export const WORKWEAR_FRONTPAGE_ORDER: readonly WorkwearProductId[] = [
  "jacke",
  "hose",
  "weste",
  "latzhose",
];

export function getWorkwearProductByIndex(imageIndex: number): WorkwearProductId {
  const productIndex = Math.floor(imageIndex / WORKWEAR_VIEWS_PER_PRODUCT);
  return WORKWEAR_PRODUCTS[productIndex]?.id ?? WORKWEAR_PRODUCTS[0].id;
}

export function getWorkwearProductStartIndex(product: WorkwearProductId): number {
  const productIndex = WORKWEAR_PRODUCTS.findIndex((entry) => entry.id === product);
  if (productIndex < 0) return 0;
  return productIndex * WORKWEAR_VIEWS_PER_PRODUCT;
}

export function getWorkwearProductShortLabel(product: WorkwearProductId): string {
  return (
    WORKWEAR_PRODUCTS.find((entry) => entry.id === product)?.shortLabel ??
    WORKWEAR_PRODUCTS[0].shortLabel
  );
}

export function getWorkwearProductPreviewImage(product: WorkwearProductId): string {
  return WORKWEAR_IMAGES[getWorkwearProductStartIndex(product)];
}

export function getWorkwearSideLabel(imageUrl: string): string {
  const normalizedUrl = imageUrl.split("?")[0]?.toLowerCase() ?? "";

  if (/\/vorne\.(jpg|jpeg|png|webp)$/.test(normalizedUrl)) return "Vorne";
  if (/\/links\.(jpg|jpeg|png|webp)$/.test(normalizedUrl)) return "Links";
  if (/\/rechts\.(jpg|jpeg|png|webp)$/.test(normalizedUrl)) return "Rechts";
  if (/\/hinten\.(jpg|jpeg|png|webp)$/.test(normalizedUrl)) return "Hinten";

  return "Ansicht";
}
