import { DEFAULT_LANGUAGE } from './arasaac';
import type { Board, Cell, Page } from './types';

export const LIMITS = {
  rows: { min: 1, max: 12 },
  cols: { min: 1, max: 12 },
  marginMm: { min: 0, max: 40 },
  gapMm: { min: 0, max: 20 },
  fontSizePt: { min: 6, max: 60 },
} as const;

export const DEFAULT_CELL_BACKGROUND = '#ffffff';

export const uid = () => crypto.randomUUID();

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function createCell(): Cell {
  return { id: uid(), imageId: null, label: '', linkPageId: null, background: DEFAULT_CELL_BACKGROUND };
}

export function createPage(name: string, template?: Partial<Page>): Page {
  const rows = template?.rows ?? 3;
  const cols = template?.cols ?? 4;
  return {
    id: uid(),
    name,
    size: template?.size ?? 'A4',
    orientation: template?.orientation ?? 'landscape',
    rows,
    cols,
    marginMm: template?.marginMm ?? 10,
    gapMm: template?.gapMm ?? 4,
    fontSizePt: template?.fontSizePt ?? 16,
    cells: Array.from({ length: rows * cols }, createCell),
  };
}

export function createBoard(name: string): Board {
  const now = Date.now();
  return { id: uid(), name, language: DEFAULT_LANGUAGE, createdAt: now, updatedAt: now, pages: [createPage('Página 1')] };
}

/** Changes grid dimensions keeping each existing cell at its (row, col) position. */
export function resizeGrid(page: Page, rows: number, cols: number): Page {
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const existing = r < page.rows && c < page.cols ? page.cells[r * page.cols + c] : undefined;
      cells.push(existing ?? createCell());
    }
  }
  return { ...page, rows, cols, cells };
}

export function duplicatePage(page: Page, name: string): Page {
  return { ...page, id: uid(), name, cells: page.cells.map((c) => ({ ...c, id: uid() })) };
}

export function duplicateBoard(board: Board, name: string): Board {
  const now = Date.now();
  return { ...structuredClone(board), id: uid(), name, createdAt: now, updatedAt: now };
}
