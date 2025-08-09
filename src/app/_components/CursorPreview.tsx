"use client";
/* eslint-disable @next/next/no-img-element */

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
  const lastPosRef = React.useRef<{ x: number; y: number }>({
    x: -9999,
    y: -9999,
  });
  const rafIdRef = React.useRef<number | null>(null);
  const currentElRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // rAF-driven position updater to avoid main-thread thrash
    const tick = () => {
      const img = imgRef.current;
      if (!img) return;
      const offset = 18;
      const { x, y } = lastPosRef.current;
      img.style.transform = `translate(${x + offset}px, ${y + offset}px)`;
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const maybeStartRaf = () => {
      if (rafIdRef.current == null && visible) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };
    const stopRaf = () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      if (visible) maybeStartRaf();
    };

    // Event delegation to reduce per-element listeners
    const resolvePreviewEl = (
      target: EventTarget | null,
    ): HTMLElement | null => {
      if (!(target instanceof HTMLElement)) return null;
      return target.closest<HTMLElement>("[data-preview]");
    };

    const showPreviewFor = (el: HTMLElement) => {
      const url = el.getAttribute("data-preview");
      if (!url || !imgRef.current) return;
      const src = url.includes("?")
        ? `${url}&w=640&q=70&auto=format`
        : `${url}?w=640&q=70&auto=format`;
      if (imgRef.current.src !== src) imgRef.current.src = src;
      currentElRef.current = el;
      setVisible(true);
      maybeStartRaf();
    };

    const hidePreview = () => {
      currentElRef.current = null;
      setVisible(false);
      stopRaf();
    };

    const onMouseOver = (e: MouseEvent) => {
      const el = resolvePreviewEl(e.target);
      if (el) showPreviewFor(el);
    };
    const onMouseOut = (e: MouseEvent) => {
      const fromEl = currentElRef.current;
      if (!fromEl) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !fromEl.contains(related)) hidePreview();
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = resolvePreviewEl(e.target);
      if (el) showPreviewFor(el);
    };
    const onFocusOut = (e: FocusEvent) => {
      const fromEl = currentElRef.current;
      if (!fromEl) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !fromEl.contains(related)) hidePreview();
    };

    container.addEventListener("mousemove", onPointerMove, { passive: true });
    container.addEventListener("mouseover", onMouseOver, {
      capture: true,
      passive: true,
    });
    container.addEventListener("mouseout", onMouseOut, {
      capture: true,
      passive: true,
    });
    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("focusout", onFocusOut);

    return () => {
      stopRaf();
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseover", onMouseOver, true);
      container.removeEventListener("mouseout", onMouseOut, true);
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("focusout", onFocusOut);
    };
  }, [visible]);

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
        decoding="async"
        loading="lazy"
        style={{
          transform: "translate(-9999px, -9999px)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
