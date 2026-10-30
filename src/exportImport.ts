import { DEFAULT_LANGUAGE, isArasaacLanguage } from './arasaac';
import { findImageByArasaacId, getImage, saveImage } from './db';
import { ALLOWED_IMAGE_TYPES } from './library';
import { clamp, createCell, DEFAULT_CELL_BACKGROUND, LIMITS, uid } from './model';
import { PAPER_SIZES } from './paper';
import type { Board, BoardExport, Cell, ExportedImage, Page, PaperSize } from './types';

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function exportBoard(board: Board): Promise<Blob> {
  const ids = new Set(board.pages.flatMap((p) => p.cells.map((c) => c.imageId).filter((id): id is string => !!id)));
  const images: ExportedImage[] = [];
  for (const id of ids) {
    const img = await getImage(id);
    if (!img) continue;
    images.push({
      id: img.id,
      name: img.name,
      keywords: img.keywords,
      source: img.source,
      arasaacId: img.arasaacId,
      dataUrl: await blobToDataUrl(img.blob),
    });
  }
  const data: BoardExport = { format: 'communication-board', version: 1, board, images };
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function safeFilename(name: string) {
  return name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 80) || 'panel';
}

// ---- Import (untrusted input: validate and normalise everything) ----

type Raw = Record<string, unknown>;
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = '', max = 200) => (typeof v === 'string' ? v.slice(0, max) : fallback);
const num = (v: unknown, { min, max }: { min: number; max: number }, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? clamp(v, min, max) : fallback;
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const DATA_URL_RE = /^data:([a-z+/]+);base64,/i;

function normalizeCell(raw: unknown, imageIdMap: Map<string, string>): Cell {
  if (!isObject(raw)) return createCell();
  const imageId = typeof raw.imageId === 'string' ? imageIdMap.get(raw.imageId) ?? null : null;
  const background = str(raw.background);
  return {
    id: uid(),
    imageId,
    label: str(raw.label),
    linkPageId: typeof raw.linkPageId === 'string' ? raw.linkPageId : null,
    background: COLOR_RE.test(background) ? background : DEFAULT_CELL_BACKGROUND,
  };
}

function normalizePage(raw: unknown, index: number, imageIdMap: Map<string, string>): Page {
  if (!isObject(raw)) throw new Error('Página no válida');
  const rows = num(raw.rows, LIMITS.rows, 3);
  const cols = num(raw.cols, LIMITS.cols, 4);
  const rawCells = Array.isArray(raw.cells) ? raw.cells : [];
  const size = str(raw.size) as PaperSize;
  return {
    id: str(raw.id) || uid(),
    name: str(raw.name, `Página ${index + 1}`),
    size: size in PAPER_SIZES ? size : 'A4',
    orientation: raw.orientation === 'portrait' ? 'portrait' : 'landscape',
    rows,
    cols,
    marginMm: num(raw.marginMm, LIMITS.marginMm, 10),
    gapMm: num(raw.gapMm, LIMITS.gapMm, 4),
    fontSizePt: num(raw.fontSizePt, LIMITS.fontSizePt, 16),
    cells: Array.from({ length: rows * cols }, (_, i) => normalizeCell(rawCells[i], imageIdMap)),
  };
}

async function importImages(rawImages: unknown): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!Array.isArray(rawImages)) return map;
  for (const raw of rawImages) {
    if (!isObject(raw) || typeof raw.id !== 'string' || typeof raw.dataUrl !== 'string') continue;
    const mime = DATA_URL_RE.exec(raw.dataUrl)?.[1]?.toLowerCase();
    if (!mime || !ALLOWED_IMAGE_TYPES.includes(mime)) continue;

    const arasaacId = typeof raw.arasaacId === 'number' && Number.isInteger(raw.arasaacId) ? raw.arasaacId : undefined;
    const existing = (arasaacId !== undefined && (await findImageByArasaacId(arasaacId))) || (await getImage(raw.id));
    if (existing) {
      map.set(raw.id, existing.id);
      continue;
    }
    const blob = await (await fetch(raw.dataUrl)).blob();
    const keywords = Array.isArray(raw.keywords) ? raw.keywords.filter((k): k is string => typeof k === 'string') : [];
    await saveImage({
      id: raw.id,
      name: str(raw.name, 'imagen'),
      keywords,
      source: raw.source === 'arasaac' ? 'arasaac' : 'user',
      arasaacId,
      blob,
      createdAt: Date.now(),
    });
    map.set(raw.id, raw.id);
  }
  return map;
}

export async function importBoard(file: File): Promise<Board> {
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error('El archivo no es un JSON válido');
  }
  if (!isObject(data) || data.format !== 'communication-board' || !isObject(data.board)) {
    throw new Error('El archivo no es un panel de comunicación');
  }
  const rawPages = Array.isArray(data.board.pages) ? data.board.pages : [];
  if (rawPages.length === 0) throw new Error('El panel no contiene páginas');

  const imageIdMap = await importImages(data.images);
  const pages = rawPages.map((p, i) => normalizePage(p, i, imageIdMap));
  const pageIds = new Set<string>();
  for (const page of pages) {
    if (pageIds.has(page.id)) page.id = uid();
    pageIds.add(page.id);
  }
  for (const page of pages) {
    for (const cell of page.cells) {
      if (cell.linkPageId && !pageIds.has(cell.linkPageId)) cell.linkPageId = null;
    }
  }
  const now = Date.now();
  return {
    id: uid(),
    name: str(data.board.name, 'Panel importado'),
    language: isArasaacLanguage(data.board.language) ? data.board.language : DEFAULT_LANGUAGE,
    createdAt: now,
    updatedAt: now,
    pages,
  };
}
