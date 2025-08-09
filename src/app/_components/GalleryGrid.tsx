"use client";

import React from "react";
import Image from "next/image";
import { sanityImageLoader } from "@/sanity/lib/image";
import Lightbox, { type LightboxImage } from "./Lightbox";
// Cursor preview is intentionally not used here; it's only for the homepage

type GalleryGridProps = {
  images: LightboxImage[];
};

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const onOpen = (idx: number) => setOpenIndex(idx);
  const onClose = () => setOpenIndex(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 content-visibility-auto">
        {images.map((img, idx) => (
          <figure key={img.url} className="space-y-2 reveal">
            <button
              type="button"
              className="relative block w-full overflow-hidden rounded"
              onClick={() => onOpen(idx)}
            >
              <div className="ratio">
                <Image
                  loader={sanityImageLoader}
                  src={img.url}
                  alt={img.caption || ""}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  placeholder={img.lqip ? "blur" : undefined}
                  blurDataURL={img.lqip || undefined}
                  className="object-cover"
                />
              </div>
            </button>
            {img.caption && (
              <figcaption className="nav-sans text-xs text-muted">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {openIndex != null && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={onClose}
          onIndexChange={setOpenIndex}
        />
      )}
    </>
  );
}
