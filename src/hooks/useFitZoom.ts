import { useEffect, useRef, useState } from 'react';
import { PX_PER_MM } from '../paper';

/** Zoom factor that fits a sheet of the given physical size inside the container. */
export function useFitZoom(widthMm: number, heightMm: number, paddingPx = 24) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth - paddingPx * 2;
      const h = el.clientHeight - paddingPx * 2;
      setZoom(Math.max(0.1, Math.min(w / (widthMm * PX_PER_MM), h / (heightMm * PX_PER_MM))));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [widthMm, heightMm, paddingPx]);

  return { ref, zoom };
}
