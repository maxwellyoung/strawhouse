"use client";

import React from "react";

type CursorPreviewProps = {
  children: React.ReactNode;
};

/**
 * Wrap a region to enable a cursor-following image preview for any descendant
 * element with a `data-preview` attribute containing an image URL.
 */
export default function CursorPreview({ children }: CursorPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e: MouseEvent) => {
      const img = imgRef.current;
      if (!img) return;
      const offset = 18;
      img.style.transform = `translate(${e.clientX + offset}px, ${e.clientY + offset}px)`;
    };

    const onEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement | null;
      const url = target?.getAttribute("data-preview");
      if (!url || !imgRef.current) return;
      // Prefer modest width for perf; Sanity will handle params
      const src = url.includes("?")
        ? `${url}&w=640&auto=format`
        : `${url}?w=640&auto=format`;
      imgRef.current.src = src;
      setVisible(true);
    };
    const onLeave = () => setVisible(false);

    const links = Array.from(
      container.querySelectorAll<HTMLElement>("[data-preview]"),
    );

    links.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("focus", onEnter);
      el.addEventListener("blur", onLeave);
    });
    window.addEventListener("mousemove", handleMove);

    return () => {
      links.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("focus", onEnter);
        el.removeEventListener("blur", onLeave);
      });
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {children}
      {/* Floating image that follows the cursor */}
      <img
        ref={imgRef}
        alt=""
        aria-hidden
        className={`pointer-events-none fixed z-40 h-40 w-auto rounded-sm shadow-sm transition-opacity duration-150 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: "translate(-9999px, -9999px)" }}
      />
    </div>
  );
}
