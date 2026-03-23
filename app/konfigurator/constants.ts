const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_WORKWEAR_BASE_URL || '').replace(/\/+$/, '');
const IMAGE_VERSION = process.env.NEXT_PUBLIC_WORKWEAR_IMAGE_VERSION || '';
const WORKWEAR_VIEW_FILENAMES = [
  'vorne.jpg',
  'hinten.jpg',
  'links.jpg',
  'rechts.jpg',
] as const;

const buildImageSequence = (folder: 'jacke' | 'hose') =>
  WORKWEAR_VIEW_FILENAMES.map((fileName) => {
    const relativePath = folder + '/' + fileName;
    const baseUrl = STORAGE_BASE_URL + '/' + relativePath;

    // Uses Supabase Storage exclusively
    return IMAGE_VERSION ? baseUrl + '?v=' + IMAGE_VERSION : baseUrl;
  });

const WORKWEAR_JACKE_IMAGES = buildImageSequence('jacke');
const WORKWEAR_HOSE_IMAGES = buildImageSequence('hose');


export const WORKWEAR_IMAGES: readonly string[] = [
  ...WORKWEAR_JACKE_IMAGES,
  ...WORKWEAR_HOSE_IMAGES,
];
export const DEFAULT_WORKWEAR_INDEX = 0;

export const PREVIEW_DROP_ID = 'preview-drop';
export const ZONE_DROP_PREFIX = 'zone:';
export const MAX_ZONES_PER_WORKWEAR_IMAGE = 5;

export const INITIAL_ZONE_RECT = {
  x: 56,
  y: 29,
  w: 18,
  h: 10,
};