/* eslint-disable @next/next/no-img-element */

import { useDraggable } from '@dnd-kit/core';
import { type CSSProperties } from 'react';

import type { Asset } from '../types';

type DraggableAssetCardProps = {
  asset: Asset;
  onAssign: (assetId: string) => void;
  onRemove: (assetId: string) => void;
};

export default function DraggableAssetCard({
  asset,
  onAssign,
  onRemove,
}: DraggableAssetCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'asset:' + asset.id,
  });

  const style: CSSProperties = {
    transform: transform
      ? 'translate3d(' + transform.x + 'px, ' + transform.y + 'px, 0)'
      : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full touch-none rounded-lg border border-white/20 bg-black/40 p-3 text-left transition hover:border-nordwerk-orange"
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onAssign(asset.id)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <img
            src={asset.src}
            alt={asset.name}
            className="h-12 w-12 rounded border border-white/20 object-cover"
          />
          <div className="min-w-0">
            <p className="max-w-37.5 truncate text-sm font-medium text-white/90">{asset.name}</p>
            <p className="text-xs text-white/60">In die Zone ziehen oder klicken</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onRemove(asset.id)}
          className="rounded-md border border-red-300/35 px-2 py-1 text-xs font-medium text-red-200 transition hover:border-red-200/60 hover:text-white"
          aria-label={'Bild ' + asset.name + ' entfernen'}
        >
          Entfernen
        </button>
      </div>
    </div>
  );
}
