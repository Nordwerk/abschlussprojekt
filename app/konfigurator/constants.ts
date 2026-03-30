const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_WORKWEAR_BASE_URL || '').replace(/\/+$/, '');
const IMAGE_VERSION = process.env.NEXT_PUBLIC_WORKWEAR_IMAGE_VERSION || String(Date.now());
const WORKWEAR_VIEW_FILENAMES = [
  'vorne.jpg',
  'hinten.jpg',
  'links.jpg',
  'rechts.jpg',
] as const;

export const WORKWEAR_PRODUCTS = [
  {
    id: 'jacke',
    label: 'Jacke',
    shortLabel: 'Jacke',
    folder: 'jacke',
    imageExtension: 'png',
  },
  {
    id: 'hose',
    label: 'Hose',
    shortLabel: 'Hose',
    folder: 'hose',
    imageExtension: 'png',
  },
  {
    id: 'latzhose',
    label: 'Latzhose',
    shortLabel: 'Latzhose',
    folder: 'latzhose',
    imageExtension: 'png',
  },
  {
    id: 'weste',
    label: 'Weste',
    shortLabel: 'Weste',
    folder: 'weste',
    imageExtension: 'png',
  },
] as const;

export type WorkwearProductId = (typeof WORKWEAR_PRODUCTS)[number]['id'];
export const WORKWEAR_VIEWS_PER_PRODUCT = WORKWEAR_VIEW_FILENAMES.length;

const buildImageSequence = (folder: string, imageExtension: string) =>
  WORKWEAR_VIEW_FILENAMES.map((fileName) => {
    const viewName = fileName.replace(/\.[^.]+$/, '');
    const relativePath = folder + '/' + viewName + '.' + imageExtension;
    const baseUrl = STORAGE_BASE_URL + '/' + relativePath;

    // Uses Supabase Storage exclusively
    return IMAGE_VERSION ? baseUrl + '?v=' + IMAGE_VERSION : baseUrl;
  });

export const WORKWEAR_IMAGES: readonly string[] = [
  ...WORKWEAR_PRODUCTS.flatMap((product) =>
    buildImageSequence(product.folder, product.imageExtension),
  ),
];
export const DEFAULT_WORKWEAR_INDEX = 0;

export const PREVIEW_DROP_ID = 'preview-drop';
export const ZONE_DROP_PREFIX = 'zone:';

// Maximale Zonen pro Bild-Index
export const MAX_ZONES_PER_IMAGE: readonly number[] = WORKWEAR_IMAGES.map(
  () => 2,
);

export function getMaxZonesForImage(imageIndex: number): number {
  return MAX_ZONES_PER_IMAGE[imageIndex] ?? 2;
}

export const INITIAL_ZONE_RECT = {
  x: 56,
  y: 29,
  w: 11.3,
  h: 6.3,
};