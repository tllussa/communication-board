import type { ReactNode } from 'react';
import { useImageUrl } from '../hooks/useImageUrl';
import { useFitZoom } from '../hooks/useFitZoom';
import { pageDimensions, printPageClass } from '../paper';
import type { Cell, Page } from '../types';

interface SheetProps {
  page: Page;
  selectedCellId?: string | null;
  onCellClick?: (cell: Cell) => void;
}

/** A page rendered at its real physical size (mm), ready for printing. */
export function Sheet({ page, selectedCellId, onCellClick }: SheetProps) {
  const { width, height } = pageDimensions(page.size, page.orientation);
  return (
    <div
      className={`sheet ${printPageClass(page)}`}
      style={{ width: `${width}mm`, height: `${height}mm`, padding: `${page.marginMm}mm` }}
    >
      <div
        className="sheet-grid"
        style={{
          gridTemplateColumns: `repeat(${page.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${page.rows}, minmax(0, 1fr))`,
          gap: `${page.gapMm}mm`,
        }}
      >
        {page.cells.map((cell) => (
          <CellView
            key={cell.id}
            cell={cell}
            fontSizePt={page.fontSizePt}
            selected={cell.id === selectedCellId}
            onClick={onCellClick && (() => onCellClick(cell))}
          />
        ))}
      </div>
    </div>
  );
}

function CellView({
  cell,
  fontSizePt,
  selected,
  onClick,
}: {
  cell: Cell;
  fontSizePt: number;
  selected: boolean;
  onClick?: () => void;
}) {
  const url = useImageUrl(cell.imageId);
  const className = `cell${selected ? ' selected' : ''}${cell.linkPageId ? ' linked' : ''}${onClick ? ' clickable' : ''}`;
  const content = (
    <>
      <div className="cell-image">{url && <img src={url} alt="" draggable={false} />}</div>
      {cell.label && (
        <div className="cell-label" dir="auto" style={{ fontSize: `${fontSizePt}pt` }}>
          {cell.label}
        </div>
      )}
    </>
  );
  return onClick ? (
    <button type="button" className={className} style={{ background: cell.background }} onClick={onClick} aria-label={cell.label || 'Celda vacía'}>
      {content}
    </button>
  ) : (
    <div className={className} style={{ background: cell.background }}>
      {content}
    </div>
  );
}

/** Scales a sheet to fit the available area on screen (zoom is reset when printing). */
export function SheetViewport({ page, children }: { page: Page; children: ReactNode }) {
  const { width, height } = pageDimensions(page.size, page.orientation);
  const { ref, zoom } = useFitZoom(width, height);
  return (
    <div className="sheet-viewport" ref={ref}>
      <div className="sheet-zoom" style={{ zoom }}>
        {children}
      </div>
    </div>
  );
}
