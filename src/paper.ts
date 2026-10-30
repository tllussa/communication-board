import type { Orientation, Page, PaperSize } from './types';

export const PAPER_SIZES: Record<PaperSize, { label: string; widthMm: number; heightMm: number }> = {
  A6: { label: 'A6 (105 × 148 mm)', widthMm: 105, heightMm: 148 },
  A5: { label: 'A5 (148 × 210 mm)', widthMm: 148, heightMm: 210 },
  A4: { label: 'A4 (210 × 297 mm)', widthMm: 210, heightMm: 297 },
  A3: { label: 'A3 (297 × 420 mm)', widthMm: 297, heightMm: 420 },
  A2: { label: 'A2 (420 × 594 mm)', widthMm: 420, heightMm: 594 },
  Letter: { label: 'Carta (216 × 279 mm)', widthMm: 216, heightMm: 279 },
  Legal: { label: 'Legal (216 × 356 mm)', widthMm: 216, heightMm: 356 },
};

export const PX_PER_MM = 96 / 25.4;

export function pageDimensions(size: PaperSize, orientation: Orientation) {
  const { widthMm, heightMm } = PAPER_SIZES[size];
  return orientation === 'portrait'
    ? { width: widthMm, height: heightMm }
    : { width: heightMm, height: widthMm };
}

export function printPageClass(page: Pick<Page, 'size' | 'orientation'>) {
  return `pp-${page.size}-${page.orientation}`;
}

/** Named @page rules so each sheet prints on its own paper size and orientation. */
export function printStyles() {
  const orientations: Orientation[] = ['portrait', 'landscape'];
  return (Object.keys(PAPER_SIZES) as PaperSize[])
    .flatMap((size) =>
      orientations.map((orientation) => {
        const name = printPageClass({ size, orientation });
        const { width, height } = pageDimensions(size, orientation);
        return `@page ${name} { size: ${width}mm ${height}mm; margin: 0; } .${name} { page: ${name}; }`;
      }),
    )
    .join('\n');
}
