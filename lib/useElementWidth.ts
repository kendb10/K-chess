"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks the rendered width of an element so responsive children (e.g. a chessboard) can size to it. */
export function useElementWidth<T extends HTMLElement>(maxWidth = 560) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(maxWidth);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setWidth(Math.min(el.clientWidth, maxWidth));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxWidth]);

  return { ref, width };
}
