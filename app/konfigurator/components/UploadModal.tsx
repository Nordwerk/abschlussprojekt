/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from 'react';

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: FileList) => void;
};

export default function UploadModal({ isOpen, onClose, onFilesSelected }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onFilesSelected(e.dataTransfer.files);
      onClose();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-br from-black/80 to-black/40 p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Modal schließen"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white">Dateien hochladen</h2>
        <p className="mt-2 text-sm text-white/70">
          Wähle deine Logos oder Bilder aus
        </p>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 transition cursor-pointer ${
            isDragging
              ? 'border-nordwerk-orange bg-nordwerk-orange/10'
              : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
          }`}
        >
          <svg
            className={`h-16 w-16 transition ${isDragging ? 'text-nordwerk-orange' : 'text-white/60'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16v-4m0 0V8m0 4h4m-4 0H8m9-1a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-center text-lg font-semibold text-white">
            {isDragging ? 'Dateien ablegen' : 'Dateien hier ablegen'}
          </p>
          <p className="mt-2 text-sm text-white/60">
            oder klicken zum Durchsuchen
          </p>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Supported Formats */}
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Unterstützte Formate
          </p>
          <p className="mt-2 text-sm text-white/70">PNG, JPG, BMP, GIF, SVG</p>
          <p className="mt-1 text-xs text-white/50">Maximale Größe: 10 MB pro Datei</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/20 px-4 py-3 font-medium text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Abbrechen
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded-lg bg-nordwerk-orange px-4 py-3 font-semibold text-black transition hover:opacity-90"
          >
            Dateien auswählen
          </button>
        </div>
      </div>
    </div>
  );
}
