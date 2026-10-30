import { openDB, type DBSchema } from 'idb';
import type { Board, LibraryImage } from './types';

interface Schema extends DBSchema {
  boards: { key: string; value: Board; indexes: { 'by-updated': number } };
  images: { key: string; value: LibraryImage; indexes: { 'by-arasaac': number } };
}

const dbPromise = openDB<Schema>('communication-board', 1, {
  upgrade(db) {
    const boards = db.createObjectStore('boards', { keyPath: 'id' });
    boards.createIndex('by-updated', 'updatedAt');
    const images = db.createObjectStore('images', { keyPath: 'id' });
    images.createIndex('by-arasaac', 'arasaacId');
  },
});

export async function listBoards() {
  const boards = await (await dbPromise).getAllFromIndex('boards', 'by-updated');
  return boards.reverse();
}

export async function getBoard(id: string) {
  return (await dbPromise).get('boards', id);
}

export async function saveBoard(board: Board) {
  await (await dbPromise).put('boards', { ...board, updatedAt: Date.now() });
}

export async function deleteBoard(id: string) {
  await (await dbPromise).delete('boards', id);
}

export async function listImages() {
  const images = await (await dbPromise).getAll('images');
  return images.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function getImage(id: string) {
  return (await dbPromise).get('images', id);
}

export async function findImageByArasaacId(arasaacId: number) {
  return (await dbPromise).getFromIndex('images', 'by-arasaac', arasaacId);
}

export async function saveImage(image: LibraryImage) {
  await (await dbPromise).put('images', image);
}

export async function deleteImage(id: string) {
  await (await dbPromise).delete('images', id);
}
