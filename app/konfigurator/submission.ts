import { WORKWEAR_IMAGES } from "./constants";
import type { Asset, ZoneRectangle } from "./types";
import type { WorkwearZoneState } from "./workwearState";

export type ConfiguratorSnapshot = {
  imageIndex: number;
  imageUrl: string;
  dataUrl: string;
};

const SNAPSHOT_WIDTH = 768;
const SNAPSHOT_HEIGHT = 1320;

function hasAssignedArtwork(zones: ZoneRectangle[]) {
  return zones.some((zone) => zone.assetId !== null);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    if (!src.startsWith("blob:")) {
      image.crossOrigin = "anonymous";
    }

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded: " + src));
    image.src = src;
  });
}

function drawImageContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;
  let offsetX = x;
  let offsetY = y;

  if (imageRatio > boxRatio) {
    drawHeight = width / imageRatio;
    offsetY = y + (height - drawHeight) / 2;
  } else {
    drawWidth = height * imageRatio;
    offsetX = x + (width - drawWidth) / 2;
  }

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function drawArtworkInZone(
  context: CanvasRenderingContext2D,
  assetImage: HTMLImageElement,
  zone: ZoneRectangle,
) {
  const zoneX = (zone.x / 100) * SNAPSHOT_WIDTH;
  const zoneY = (zone.y / 100) * SNAPSHOT_HEIGHT;
  const zoneWidth = (zone.w / 100) * SNAPSHOT_WIDTH;
  const zoneHeight = (zone.h / 100) * SNAPSHOT_HEIGHT;

  context.save();
  context.beginPath();
  context.rect(zoneX, zoneY, zoneWidth, zoneHeight);
  context.clip();

  context.translate(
    zoneX + zoneWidth / 2 + zone.artworkOffset.x,
    zoneY + zoneHeight / 2 + zone.artworkOffset.y,
  );
  context.rotate((zone.rotation * Math.PI) / 180);
  context.scale(zone.scale, zone.scale);

  drawImageContain(
    context,
    assetImage,
    -zoneWidth / 2,
    -zoneHeight / 2,
    zoneWidth,
    zoneHeight,
  );

  context.restore();
}

async function renderSnapshotDataUrl(
  imageUrl: string,
  zones: ZoneRectangle[],
  assetMap: Map<string, Asset>,
) {
  const canvas = document.createElement("canvas");
  canvas.width = SNAPSHOT_WIDTH;
  canvas.height = SNAPSHOT_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context is not available");
  }

  context.clearRect(0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT);

  const baseImage = await loadImage(imageUrl);
  drawImageContain(context, baseImage, 0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT);

  for (const zone of zones) {
    if (!zone.assetId) continue;

    const asset = assetMap.get(zone.assetId);
    if (!asset) continue;

    const assetImage = await loadImage(asset.src);
    drawArtworkInZone(context, assetImage, zone);
  }

  return canvas.toDataURL("image/jpeg", 0.86);
}

export async function createConfiguredSnapshots(
  stateByIndex: Record<number, WorkwearZoneState>,
  assets: Asset[],
): Promise<ConfiguratorSnapshot[]> {
  const assetMap = new Map<string, Asset>(assets.map((asset) => [asset.id, asset]));
  const snapshots: ConfiguratorSnapshot[] = [];

  for (let imageIndex = 0; imageIndex < WORKWEAR_IMAGES.length; imageIndex += 1) {
    const imageState = stateByIndex[imageIndex];
    if (!imageState || !hasAssignedArtwork(imageState.zones)) continue;

    const imageUrl = WORKWEAR_IMAGES[imageIndex];
    const dataUrl = await renderSnapshotDataUrl(imageUrl, imageState.zones, assetMap);

    snapshots.push({
      imageIndex,
      imageUrl,
      dataUrl,
    });
  }

  return snapshots;
}
