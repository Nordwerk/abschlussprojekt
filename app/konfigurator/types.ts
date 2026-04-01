export type Point = {
  x: number;
  y: number;
};

export type Asset = {
  id: string;
  name: string;
  src: string;
};

export type ZoneRectangle = {
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

export type ZoneResizeState = {
  zoneId: string;
  pointerId: number;
  corner: 'tl' | 'tr' | 'bl' | 'br';
  startPointerX: number;
  startPointerY: number;
  startZoneX: number;
  startZoneY: number;
  startZoneW: number;
  startZoneH: number;
};

export type PrintMaterial = "druck" | "stick";
