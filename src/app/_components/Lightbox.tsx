"use client";

import React from "react";
import Image from "next/image";
import { sanityImageLoader } from "@/sanity/lib/image";

export type LightboxImage = {
  url: string;
  caption?: string;
  lqip?: string;
};

type LightboxProps = {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndexChange?: (idx: number) => void;
};

export default function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const [current, setCurrent] = React.useState(index);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const total = images.length;

  const go = React.useCallback(
    (dir: 1 | -1) => {
      const next = (current + dir + total) % total;
      setCurrent(next);
      onIndexChange?.(next);
    },
    [current, total, onIndexChange],
  );

  React.useEffect(() => {
    setCurrent(index);
  }, [index]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Close when clicking outside the panel
  const onBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === containerRef.current) onClose();
  };

  const img = images[current];
  // Construct a reasonably large src for lightbox viewing
  const dpr =
    typeof window !== "undefined"
      ? Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1)))
      : 1;
  // Kept for potential non-next/image fallback
  // const lightboxSrc = img.url.includes("?")
  //   ? `${img.url}&w=1600&q=80&auto=format&dpr=${dpr}`
  //   : `${img.url}?w=1600&q=80&auto=format&dpr=${dpr}`;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-[fadeIn_120ms_ease]"
      onMouseDown={onBackdropClick}
    >
      {/* Fullscreen stage */}
      <div className="relative h-full w-full">
        {/* Loader */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>

        {/* Image */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
          <Image
            loader={sanityImageLoader}
            src={img.url}
            alt={img.caption || ""}
            fill
            sizes="100vw"
            className="object-contain [image-orientation:from-image]"
            priority
          />
        </div>

        {/* Caption and controls overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 text-xs text-white/90">
          <div className="truncate">{img.caption}</div>
          {total > 1 && (
            <div className="tabular-nums">
              {current + 1} / {total}
            </div>
          )}
        </div>

        {/* Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white shadow-md backdrop-blur-md transition hover:bg-white/20"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white shadow-md backdrop-blur-md transition hover:bg-white/20"
            >
              ›
            </button>
          </>
        )}

        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white shadow backdrop-blur-md transition hover:bg-white/20"
        >
          Esc
        </button>
      </div>
    </div>
  );
}
