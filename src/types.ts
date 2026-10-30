export type PaperSize = 'A6' | 'A5' | 'A4' | 'A3' | 'A2' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';

export interface Cell {
  id: string;
  imageId: string | null;
  label: string;
  /** Page of the same board opened when the cell is pressed in view mode. */
  linkPageId: string | null;
  background: string;
}

export interface Page {
  id: string;
  name: string;
  size: PaperSize;
  orientation: Orientation;
  rows: number;
  cols: number;
  marginMm: number;
  gapMm: number;
  fontSizePt: number;
  /** Row-major, always rows * cols items. */
  cells: Cell[];
}

export interface Board {
  id: string;
  name: string;
  /** ARASAAC language code used for cell descriptions; boards saved before this field default to 'es'. */
  language?: string;
  createdAt: number;
  updatedAt: number;
  pages: Page[];
}

export type ImageSource = 'arasaac' | 'user';

export interface LibraryImage {
  id: string;
  name: string;
  keywords: string[];
  source: ImageSource;
  arasaacId?: number;
  blob: Blob;
  createdAt: number;
}

export interface ExportedImage {
  id: string;
  name: string;
  keywords: string[];
  source: ImageSource;
  arasaacId?: number;
  dataUrl: string;
}

export interface BoardExport {
  format: 'communication-board';
  version: 1;
  board: Board;
  images: ExportedImage[];
}
