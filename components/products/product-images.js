"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_IMAGE = "/placeholder.svg";
const SWIPE_THRESHOLD_PX = 40;

function buildGallery(mainImage, images) {
  const candidates = [mainImage, ...(Array.isArray(images) ? images : [])];
  const seen = new Set();
  const gallery = [];
  candidates.forEach((candidate) => {
    if (typeof candidate !== "string") return;
    const trimmed = candidate.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    gallery.push(trimmed);
  });
  return gallery.length > 0 ? gallery : [FALLBACK_IMAGE];
}

export function ProductImages({ name, mainImage, images, productId }) {
  const gallery = useMemo(
    () => buildGallery(mainImage, images),
    [mainImage, images]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [productId]);

  const count = gallery.length;
  const safeIndex = Math.min(Math.max(selectedIndex, 0), count - 1);
  const hasMultiple = count > 1;

  const showPrevious = () =>
    setSelectedIndex((current) => (current - 1 + count) % count);
  const showNext = () =>
    setSelectedIndex((current) => (current + 1) % count);

  const handleKeyDown = (event) => {
    if (!hasMultiple) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (!hasMultiple || touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX < 0) showNext();
    else showPrevious();
  };

  return (
    <div
      role="region"
      aria-label={`${name} image gallery`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="space-y-4 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <div
        className="group aspect-square relative overflow-hidden rounded-2xl bg-muted/60 ring-1 ring-border/40 shadow-[var(--shadow-card)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={gallery[safeIndex]}
          src={gallery[safeIndex]}
          alt={`${name} - view ${safeIndex + 1} of ${count}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover animate-fade-in"
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center size-9 rounded-full bg-background/80 text-foreground shadow-[var(--shadow-card)] backdrop-blur transition hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center size-9 rounded-full bg-background/80 text-foreground shadow-[var(--shadow-card)] backdrop-blur transition hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <ChevronRight className="size-4" />
            </button>
            <span
              aria-live="polite"
              className="absolute bottom-3 right-3 z-10 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur"
            >
              {safeIndex + 1} / {count}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex flex-wrap gap-2">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show image ${index + 1} of ${count}`}
              aria-current={index === safeIndex ? "true" : undefined}
              className={`aspect-square w-20 relative overflow-hidden rounded-xl bg-muted/60 transition-all ${
                index === safeIndex
                  ? "ring-2 ring-primary opacity-100"
                  : "ring-1 ring-border/40 opacity-70 hover:opacity-100 hover:ring-ring/50 focus-visible:ring-2 focus-visible:ring-ring/50"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
