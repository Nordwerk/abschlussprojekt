const buildImageSequence = (
  folder: 'jacke' | 'hose',
  articleNumber: '1250' | '2850',
) =>
  Array.from(
    { length: 24 },
    (_, index) =>
      `/${folder}/${articleNumber}-${String(index + 1).padStart(2, '0')}.jpg`,
  );

export const WORKWEAR_IMAGES: readonly string[] = [
  ...buildImageSequence('jacke', '1250'),
  ...buildImageSequence('hose', '2850'),
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
