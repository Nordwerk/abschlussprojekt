import type { ZoneRect } from "../types";

/**
 * Generates a CSS transform string for artwork within a zone
 * Applies translation, rotation, and scale transformations
 */
export function getArtworkTransform(
  zone: Pick<ZoneRect, "artworkOffset" | "rotation" | "scale">
) {
  return `translate(${zone.artworkOffset.x}px, ${zone.artworkOffset.y}px) rotate(${zone.rotation}deg) scale(${zone.scale})`;
}
