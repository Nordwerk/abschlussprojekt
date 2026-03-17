export type Point = {
  x: number;
  y: number;
};

export type Asset = {
  id: string;
  name: string;
  src: string;
};

export type ZoneRect = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  rotation: number;
  assetId: string | null;
  artworkOffset: Point;
};

export type ZoneDragState = {
  zoneId: string;
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startZoneX: number;
  startZoneY: number;
};

export type ArtworkDragState = {
  zoneId: string;
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startOffsetX: number;
  startOffsetY: number;
};

export type PanDragState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startPanX: number;
  startPanY: number;
};
