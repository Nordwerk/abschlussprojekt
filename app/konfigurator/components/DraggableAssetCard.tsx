/* eslint-disable @next/next/no-img-element */

import { useDraggable } from '@dnd-kit/core';
import { type CSSProperties } from 'react';

import type { Asset } from '../types';

type DraggableAssetCardProps = {
  asset: Asset;
  onAssign: (assetId: string) => void;
};

export default function DraggableAssetCard({ asset, onAssign }: DraggableAssetCardProps) {
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
    <button
      ref={setNodeRef}
      style={style}
      className="w-full touch-none rounded-lg border border-white/20 bg-black/40 p-3 text-left transition hover:border-nordwerk-orange"
      {...listeners}
      {...attributes}
      onClick={() => onAssign(asset.id)}
      type="button"
    >
      <div className="flex items-center gap-3">
        <img
          src={asset.src}
          alt={asset.name}
          className="h-12 w-12 rounded border border-white/20 object-cover"
        />
        <div className="min-w-0">
          <p className="max-w-37.5 truncate text-sm font-medium text-white/90">{asset.name}</p>
          <p className="text-xs text-white/60">In die Zone ziehen oder klicken</p>
        </div>
      </div>
    </button>
  );
}
