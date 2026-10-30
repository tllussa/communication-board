import { downloadArasaac, getArasaacKeyword, type ArasaacResult } from './arasaac';
import { findImageByArasaacId, getImage, saveImage } from './db';
import { uid } from './model';
import type { Board, LibraryImage } from './types';

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function addArasaacImage(result: ArasaacResult): Promise<LibraryImage> {
  const existing = await findImageByArasaacId(result.id);
  if (existing) return existing;
  const image: LibraryImage = {
    id: uid(),
    name: result.keywords[0] ?? `arasaac-${result.id}`,
    keywords: result.keywords.map((k) => k.toLowerCase()),
    source: 'arasaac',
    arasaacId: result.id,
    blob: await downloadArasaac(result.id),
    createdAt: Date.now(),
  };
  await saveImage(image);
  return image;
}

/** Description for an image in the given language (ARASAAC keyword, falling back to the image name). */
export async function imageLabel(image: LibraryImage, lang: string) {
  if (image.arasaacId === undefined) return image.name;
  return (await getArasaacKeyword(image.arasaacId, lang).catch(() => null)) ?? image.name;
}

/** New labels (by cell id) for every cell showing an ARASAAC pictogram. */
export async function translateLabels(board: Board, lang: string) {
  const keywords = new Map<number, string | null>();
  const labels = new Map<string, string>();
  for (const cell of board.pages.flatMap((p) => p.cells)) {
    if (!cell.imageId) continue;
    const arasaacId = (await getImage(cell.imageId))?.arasaacId;
    if (arasaacId === undefined) continue;
    if (!keywords.has(arasaacId)) {
      keywords.set(arasaacId, await getArasaacKeyword(arasaacId, lang).catch(() => null));
    }
    const keyword = keywords.get(arasaacId);
    if (keyword) labels.set(cell.id, keyword);
  }
  return labels;
}

export async function addUserImages(files: Iterable<File>) {
  const added: LibraryImage[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      rejected.push(file.name);
      continue;
    }
    const name = file.name.replace(/\.[^.]+$/, '');
    const image: LibraryImage = {
      id: uid(),
      name,
      keywords: [name.toLowerCase()],
      source: 'user',
      blob: file,
      createdAt: Date.now(),
    };
    await saveImage(image);
    added.push(image);
  }
  return { added, rejected };
}
