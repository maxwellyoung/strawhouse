"use client";

import React from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [scale, setScale] = React.useState(1);
  const [translate, setTranslate] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const panningRef = React.useRef(false);
  const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);

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
    setLoaded(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
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

  // Mount portal and lock scroll
  React.useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Preload neighbors to avoid spinner when navigating
  React.useEffect(() => {
    if (total <= 1) return;
    const urls: string[] = [];
    const prev = (current - 1 + total) % total;
    const next = (current + 1) % total;
    urls.push(images[prev].url, images[next].url);
    const preloaded: HTMLImageElement[] = urls.map((u) => {
      const img =
        typeof window !== "undefined"
          ? new window.Image()
          : ({} as HTMLImageElement);
      const src = u.includes("?")
        ? `${u}&w=1600&q=80&auto=format`
        : `${u}?w=1600&q=80&auto=format`;
      if (img && "src" in img) (img as HTMLImageElement).src = src;
      return img;
    });
    return () => {
      // Allow GC
      preloaded.forEach((im) => (im.src = ""));
    };
  }, [current, total, images]);

  // Zoom with wheel/touchpad
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;
    const delta = -e.deltaY;
    const zoomIntensity = 0.0018; // gentle
    const newScale = Math.min(
      4,
      Math.max(1, scale * (1 + delta * zoomIntensity)),
    );
    // Keep the point under the cursor stable
    const scaleFactor = newScale / scale;
    const newTx = cursorX - (cursorX - translate.x) * scaleFactor;
    const newTy = cursorY - (cursorY - translate.y) * scaleFactor;
    setScale(newScale);
    setTranslate({ x: newTx, y: newTy });
  };

  // Pointer pan and swipe-to-navigate
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    // Ignore controls (close/prev/next)
    if ((e.target as HTMLElement)?.closest('[data-lb-control]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    panningRef.current = scale > 1; // pan when zoomed; otherwise treat as swipe
  };
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!lastPointRef.current) return;
    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    if (panningRef.current) {
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
    }
  };
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    const start = lastPointRef.current;
    lastPointRef.current = null;
    if (!start) return;
    if (!panningRef.current) {
      // swipe navigation when not zoomed
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);
      }
    }
    panningRef.current = false;
  };

  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLElement)?.closest('[data-lb-control]')) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    if (scale === 1) {
      const newScale = 2;
      const scaleFactor = newScale / scale;
      const newTx = cx - (cx - translate.x) * scaleFactor;
      const newTy = cy - (cy - translate.y) * scaleFactor;
      setScale(newScale);
      setTranslate({ x: newTx, y: newTy });
    } else {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  };

  // Close when clicking outside the panel
  const onBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === containerRef.current) onClose();
  };

  const img = images[current];
  // Construct a reasonably large src for lightbox viewing
  const dpr = 1; // unused; kept for potential future tuning
  // Kept for potential non-next/image fallback
  // const lightboxSrc = img.url.includes("?")
  //   ? `${img.url}&w=1600&q=80&auto=format&dpr=${dpr}`
  //   : `${img.url}?w=1600&q=80&auto=format&dpr=${dpr}`;

  const overlay = (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-[fadeIn_120ms_ease]"
      onMouseDown={onBackdropClick}
    >
      {/* Fullscreen stage */}
      <div
        ref={stageRef}
        className="relative h-full w-full touch-pan-y"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        {/* Loader */}
        {!loaded && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}

        {/* Image */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          <Image
            loader={sanityImageLoader}
            src={img.url}
            alt={img.caption || ""}
            fill
            sizes="100vw"
            className={`object-contain [image-orientation:from-image] transition-transform duration-200 ease-out ${
              loaded ? "opacity-100" : "opacity-95"
            }`}
            priority
            onLoadingComplete={() => setLoaded(true)}
            style={{
              transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
            }}
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
              data-lb-control
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white shadow-md backdrop-blur-md transition hover:bg-white/20"
            >
              ‹
            </button>
            <button
              data-lb-control
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
          data-lb-control
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

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
