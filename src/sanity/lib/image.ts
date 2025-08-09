import createImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageLoader } from "next/image";

import { dataset, projectId } from "../env";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => builder.image(source);

export function buildResponsiveSrc(
  src: string,
  widths: number[] = [640, 960, 1200],
) {
  const srcset = widths.map((w) => `${src}?w=${w} ${w}w`).join(", ");
  return { src, srcSet: srcset };
}

export const sanityImageLoader: ImageLoader = ({ src, width, quality }) => {
  const q = quality ?? 75;
  const hasQuery = src.includes("?");
  const sep = hasQuery ? "&" : "?";
  return `${src}${sep}w=${width}&q=${q}&auto=format`;
};
